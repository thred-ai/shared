//
//  thred-message.swift
//  App
//
//  Created by Arta Koroushnia on 2023-02-05.
//

import Capacitor

@objc(ThredMobileCore)
public class ThredMobileCore: CAPPlugin {
    
    var appVC: AppController?
    var handlers = [String : ((Any) -> ())]()

    func initController(storyboard: String, vc: String) -> UIViewController?{
        let storyboard = UIStoryboard(name: storyboard, bundle: nil)
        return storyboard.instantiateViewController(withIdentifier: vc)
    }
        
    
    @objc func sendResponse(_ call: CAPPluginCall) {
        if let id = call.getString("id"), let data = call.getString("data"), let replyHandler = handlers[id]{
            print(id)
            print(data)
            replyHandler(data)
            handlers[id] = nil
        }
    }
    
    @objc func toggleAppVisible(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let toggle = call.getBool("visible"), let appVC = self.appVC, let vc = self.bridge?.viewController as? CAPBridgeViewController{
                if toggle{
                    vc.present(appVC, animated: false, completion: nil)
                }
                else{
                    appVC.dismiss(animated: false)
                }
            }
        }
    }
    
    func confirmTransaction(txData: String, replyHandler: @escaping (Any) -> ()){
            
        let uuid = UUID().uuidString
        self.handlers[uuid] = replyHandler
        self.notifyListeners("newTransaction", data: ["request": txData, "id": uuid])
                    
    }
    
    
    @objc func openApp(_ call: CAPPluginCall) {
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
    
}
