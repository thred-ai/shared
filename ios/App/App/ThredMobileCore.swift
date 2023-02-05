//
//  thred-message.swift
//  App
//
//  Created by Arta Koroushnia on 2023-02-05.
//

import Capacitor
import MaterialComponents.MaterialBottomSheet

@objc(PluginTest)
public class ThredMobileCore: CAPPlugin {
    
    @objc func setWallet(_ call: CAPPluginCall) {
        
    }
    
    @objc func getWallet(_ call: CAPPluginCall) {
        
    }
    
    @objc func openApp(_ call: CAPPluginCall) {
        if let app = call.getString("appData"), let vc = bridge?.viewController as? CAPBridgeViewController{
            DispatchQueue.main.async{
                let viewController: AppController = AppController()

                vc.present(viewController, animated: true, completion: nil)
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
