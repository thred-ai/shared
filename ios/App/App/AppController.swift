//
//  AppController.swift
//  App
//
//  Created by Arta Koroushnia on 2023-02-04.
//

import UIKit
import WebKit
import Capacitor

class AppController: UIViewController, WKNavigationDelegate, WKScriptMessageHandlerWithReply {
    
    
    var app: [String : Any]?
    var injectedSigner: String!
    var thredCore: ThredMobileCore?
    
    @IBOutlet weak var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        if #available(iOS 14.0, *) {
            setWebviewConfig()
        }
        if let app = app, let loadUrl = app["loadURL"] as? String, let url = URL(string: loadUrl){
            let finalUrl = URLRequest(url: url)
            self.webView.load(finalUrl)
        }
    }
    
    
    @available(iOS 14.0, *)
    func setWebviewConfig(){
        webView.scrollView.maximumZoomScale = 1
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
        webView.navigationDelegate = self
        webView.allowsLinkPreview = false
        webView.isOpaque = false
        webView.backgroundColor = UIColor.clear
        webView.configuration.mediaTypesRequiringUserActionForPlayback = .all
        webView.configuration.allowsInlineMediaPlayback = true
        webView.configuration.userContentController.addUserScript(self.getZoomDisableScript())
        
        //inject wallet signer
        let script2 = WKUserScript(source: injectedSigner, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        webView.configuration.userContentController.addUserScript(script2)
        
        //set request handler
        webView.configuration.userContentController.addScriptMessageHandler(self, contentWorld: .page, name: "thred_request")
        
        //inject request redirect
        let script1 = WKUserScript(source: "function request(data) { return window.webkit.messageHandlers.thred_request.postMessage(data); } window.thred_request = request;", injectionTime: .atDocumentStart, forMainFrameOnly: false)
        
        webView.configuration.userContentController.addUserScript(script1)
        
        //inject log redirect
        let script3 = WKUserScript(source: "function captureLog(msg) { window.webkit.messageHandlers.log.postMessage(msg); } window.console.log = captureLog;", injectionTime: .atDocumentStart, forMainFrameOnly: false)
        
        webView.configuration.userContentController.addUserScript(script3)
        
        //set log
        webView.configuration.userContentController.addScriptMessageHandler(self, contentWorld: .page, name: "log")

    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage, replyHandler: @escaping (Any?, String?) -> Void) {
        if message.name == "thred_request", let messageBody = message.body as? String {

            thredCore?.confirmTransaction(txData: messageBody, replyHandler: { data in
                print("in")
                print(data)
                replyHandler(data, nil)
            })
        }
        else if message.name == "log", let log = message.body as? String{
            print("📲 " + log)
        }
    }
    
    private func getZoomDisableScript() -> WKUserScript {
        let source: String = "var meta = document.createElement('meta');" +
            "meta.name = 'viewport';" +
            "meta.content = 'width=device-width, initial-scale=1.0, maximum- scale=1.0, user-scalable=no';" +
            "var head = document.getElementsByTagName('head')[0];" + "head.appendChild(meta);"
        return WKUserScript(source: source, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
    }

}
