//
//  thred-message.m
//  App
//
//  Created by Arta Koroushnia on 2023-02-05.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>
CAP_PLUGIN(ThredMobileCore, "ThredMobileCore",
           CAP_PLUGIN_METHOD(confirmTransaction, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(openApp, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setWallet, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getWallet, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(sendResponse, CAPPluginReturnPromise);
)
