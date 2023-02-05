//
//  thred-message.m
//  App
//
//  Created by Arta Koroushnia on 2023-02-05.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>
CAP_PLUGIN(PluginTest, "ThredMessage",
           CAP_PLUGIN_METHOD(postMessage, CAPPluginReturnPromise);
)
