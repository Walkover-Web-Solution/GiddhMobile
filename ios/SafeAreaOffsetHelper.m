//
//  BiometricHelper.m
//  AMCareAtHome
//
//  Created by Hussain chhatriwala on 10/11/20.

#import <Foundation/Foundation.h>
#import <React/RCTUtils.h>
#import "React/RCTConvert.h"
#import "SafeAreaOffsetHelper.h"
@implementation SafeAreaOffsetHelper
RCT_EXPORT_MODULE()
RCT_REMAP_METHOD(getBottomOffset, resolver:(RCTPromiseResolveBlock) resolve
                   rejecter:(RCTPromiseRejectBlock) reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
      double bottomOffset = [UIApplication sharedApplication].delegate.window.safeAreaInsets.bottom;
      resolve(@{@"bottomOffset": [NSNumber numberWithDouble:bottomOffset]});
  });
}

@end
