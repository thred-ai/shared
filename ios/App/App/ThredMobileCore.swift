//
//  thred-message.swift
//  App
//
//  Created by Arta Koroushnia on 2023-02-05.
//

import Capacitor
import BottomSheet

@objc(PluginTest)
public class ThredMobileCore: CAPPlugin {
    @objc func postMessage(_ call: CAPPluginCall) {
        if let style = call.getString("path"), let vc = bridge?.viewController as? CAPBridgeViewController{
            DispatchQueue.main.async{
                BottomSheet..presentBottomSheet(
                    viewController: vc,
                    configuration: BottomSheetConfiguration(
                        cornerRadius: 10,
                        pullBarConfiguration: .visible(.init(height: 20)),
                        shadowConfiguration: .init(backgroundColor: UIColor.black.withAlphaComponent(0.6))
                    )
                )
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
