//
//  thred-message.swift
//  App
//
//  Created by Arta Koroushnia on 2023-02-05.
//

import Capacitor
import MaterialComponents.MaterialBottomSheet

@objc(ThredMobileCore)
public class ThredMobileCore: CAPPlugin {
    
    var appVC: AppController?
    
    func initController(storyboard: String, vc: String) -> UIViewController?{
        let storyboard = UIStoryboard(name: storyboard, bundle: nil)
        return storyboard.instantiateViewController(withIdentifier: vc)
    }
    
    var handlers = [String : ((Any) -> ())]()
    
    
    @objc func sendResponse(_ call: CAPPluginCall) {
        if let id = call.getString("id"), let data = call.getString("data"), let replyHandler = handlers[id]{
            print(id)
            print(data)
            replyHandler(data)
            handlers[id] = nil
        }
    }
    
    func confirmTransaction(txData: String, replyHandler: @escaping (Any) -> ()){
        if let vc = self.bridge?.viewController as? CAPBridgeViewController, let mainApp = vc.webView{
            
            let uuid = UUID().uuidString
            
            self.handlers[uuid] = replyHandler

            self.notifyListeners("newTransaction", data: ["request": txData, "id": uuid])

//            if method == "personal_sign" && !params.isEmpty{
//                let msg = params[0] as? String ?? "No Message"
//
//    //                thredCore?.
//    //                self.handler = { signed in
//    //                    if (signed){
//    //                        vc.postMessage(data: messageBody, replyHandler: { data in
//    //                            replyHandler( data, nil )
//    //                        })
//    //                    }
//    //                    else{
//    //                        let err = """
//    //                        "rejected"
//    //                        """
//    //                        print(err)
//    //                        replyHandler(err, nil)
//    //                    }
//    //                    self.handler = nil
//    //                }
//
//            }
//            else if method == "eth_signTypedData_v4" && !params.isEmpty{
//    //            guard let dataParams = params[1] as? [String:Any], let msg = dataParams["message"] as? [String:Any] else{ replyHandler(nil, nil); return }
//    //                self.handler = { signed in
//    //                    if (signed){
//    //                        vc.postMessage(data: messageBody, replyHandler: { data in
//    //                            replyHandler( data, nil )
//    //                        })
//    //                    }
//    //                    else{
//    //                        let err = """
//    //                        "rejected"
//    //                        """
//    //                        print(err)
//    //                        replyHandler(err, nil)
//    //                    }
//    //                    self.handler = nil
//    //                }
//    //                self.showPopup(text: msg, title: "Sign Message", value: nil, currency: nil)
//            }
//            else if method == "eth_sendTransaction" && !params.isEmpty{
//
//    //                self.handler = { signed in
//    //                    if (signed){
//    //                        vc.postMessage(data: messageBody, replyHandler: { data in
//    //                            replyHandler( data, nil )
//    //                        })
//    //                    }
//    //                    else{
//    //                        let err = """
//    //                        "rejected"
//    //                        """
//    //                        print(err)
//    //                        replyHandler(err, nil)
//    //                    }
//    //                    self.handler = nil
//    //                }
//    //                self.showPopup(text: customMessage(data: json), title: "Transaction Details", value: json["displayValue"] as? String ?? "0", currency: json["symbol"] as? String)
//
//            }
//            else{
//    //                vc.postMessage(data: messageBody, replyHandler: { data in
//    //                    replyHandler( data, nil )
//    //                })
//            }
        }
    }
    
    
    @objc func setWallet(_ call: CAPPluginCall) {
        
    }
    
    
    @objc func getWallet(_ call: CAPPluginCall) {
          
    }
    
    @objc func openApp(_ call: CAPPluginCall) {
        print("open app")
        DispatchQueue.main.async{
            if let data = call.getObject("app"), let signer = call.getString("signer"), let vc = self.bridge?.viewController as? CAPBridgeViewController, let appVC = self.initController(storyboard: "Main", vc: "app") as? AppController{
                self.appVC = appVC
                print(data)
                print(signer)
                appVC.app = data
                appVC.injectedSigner = signer
                appVC.thredCore = self
                vc.present(appVC, animated: true, completion: nil)
                
            }
        }
    }
    
    @objc func confirmTransaction(_ call: CAPPluginCall) {
        if let style = call.getString("path"), let vc = bridge?.viewController as? CAPBridgeViewController{
            DispatchQueue.main.async{
//                // View controller the bottom sheet will hold
//                let viewController: ViewController = ViewController()
//                // Initialize the bottom sheet with the view controller just created
//                let bottomSheet: MDCBottomSheetController = MDCBottomSheetController(contentViewController: viewController)
//                // Present the bottom sheet
//                vc.present(bottomSheet, animated: true, completion: nil)
            }
        }
        
        
//        let photos = PHPhotoLibrary.authorizationStatus()
//        if photos == .notDetermined {
//            PHPhotoLibrary.requestAuthorization({status in
//                if status == .authorized{
//                    let fetchOptions = PHFetchOptions()
//                    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
//                    fetchOptions.fetchLimit = 1
//                    let fetchResult = PHAsset.fetchAssets(with: .image, options: fetchOptions)
//                    let image = self.getAssetThumbnail(asset: fetchResult.object(at: 0))
//                    let imageData:Data =  image.pngData()!
//                    let base64String = imageData.base64EncodedString()
//                    call.resolve([
//                        "image": base64String
//                    ])
//                } else {
//                    call.reject("Not authorised to access Photos")
//                }
//            })
//        }
    }
}
