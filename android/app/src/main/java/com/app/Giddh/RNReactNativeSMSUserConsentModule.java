package com.app.Giddh;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.api.Status;

/**
 * React Native bridge for Google's SMS User Consent API.
 *
 * This reads one OTP message only after the user approves Google's system
 * dialog. It does not request READ_SMS and does not access the SMS inbox.
 */
public class RNReactNativeSMSUserConsentModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "RNReactNativeSMSUserConsent";
    private static final String RECEIVED_OTP_PROPERTY = "receivedOtpMessage";
    private static final String E_ALREADY_LISTENING = "E_ALREADY_LISTENING";
    private static final String E_NO_ACTIVITY = "E_NO_ACTIVITY";
    private static final String E_START_FAILED = "E_START_FAILED";
    private static final String E_CONSENT_UNAVAILABLE = "E_CONSENT_UNAVAILABLE";
    private static final String E_CONSENT_DENIED = "E_CONSENT_DENIED";
    private static final String E_TIMEOUT = "E_TIMEOUT";
    private static final String E_EMPTY_MESSAGE = "E_EMPTY_MESSAGE";
    private static final String E_CANCELLED = "E_CANCELLED";
    private static final int SMS_CONSENT_REQUEST = 1244;

    private final ReactApplicationContext reactContext;
    private Promise pendingPromise;
    private BroadcastReceiver receiver;
    private boolean receiverRegistered;

    public RNReactNativeSMSUserConsentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(activityEventListener);
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void listenOTP(final Promise promise) {
        final Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject(E_NO_ACTIVITY, "No active Android activity is available");
            return;
        }

        if (pendingPromise != null) {
            promise.reject(E_ALREADY_LISTENING, "SMS consent is already listening");
            return;
        }

        pendingPromise = promise;
        registerReceiver();

        SmsRetriever.getClient(activity)
            .startSmsUserConsent(null)
            .addOnFailureListener(error -> {
                rejectAndCleanup(E_START_FAILED, "Could not start SMS consent", error);
            });
    }

    @ReactMethod
    public void removeOTPListener() {
        if (pendingPromise != null) {
            rejectAndCleanup(E_CANCELLED, "SMS consent listener was cancelled", null);
        } else {
            cleanup();
        }
    }

    private void registerReceiver() {
        receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (!SmsRetriever.SMS_RETRIEVED_ACTION.equals(intent.getAction())) {
                    return;
                }

                Bundle extras = intent.getExtras();
                Status status = extras == null
                    ? null
                    : extras.getParcelable(SmsRetriever.EXTRA_STATUS);
                if (status == null) {
                    rejectAndCleanup(E_CONSENT_UNAVAILABLE, "SMS consent returned no status", null);
                    return;
                }

                if (status.getStatusCode() == CommonStatusCodes.TIMEOUT) {
                    rejectAndCleanup(E_TIMEOUT, "No OTP SMS was received within five minutes", null);
                    return;
                }

                if (status.getStatusCode() != CommonStatusCodes.SUCCESS) {
                    rejectAndCleanup(
                        E_CONSENT_UNAVAILABLE,
                        "SMS consent failed with status " + status.getStatusCode(),
                        null
                    );
                    return;
                }

                Intent consentIntent;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    consentIntent = extras.getParcelable(
                        SmsRetriever.EXTRA_CONSENT_INTENT,
                        Intent.class
                    );
                } else {
                    consentIntent = extras.getParcelable(SmsRetriever.EXTRA_CONSENT_INTENT);
                }

                Activity activity = getCurrentActivity();
                if (consentIntent == null || activity == null) {
                    rejectAndCleanup(
                        E_CONSENT_UNAVAILABLE,
                        "SMS consent dialog is unavailable",
                        null
                    );
                    return;
                }

                try {
                    unregisterReceiver();
                    activity.startActivityForResult(consentIntent, SMS_CONSENT_REQUEST);
                } catch (ActivityNotFoundException error) {
                    rejectAndCleanup(
                        E_CONSENT_UNAVAILABLE,
                        "Could not open the SMS consent dialog",
                        error
                    );
                }
            }
        };

        IntentFilter filter = new IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION);
        ContextCompat.registerReceiver(
            reactContext,
            receiver,
            filter,
            SmsRetriever.SEND_PERMISSION,
            null,
            ContextCompat.RECEIVER_EXPORTED
        );
        receiverRegistered = true;
    }

    private final ActivityEventListener activityEventListener =
        new BaseActivityEventListener() {
            @Override
            public void onActivityResult(
                Activity activity,
                int requestCode,
                int resultCode,
                Intent data
            ) {
                if (requestCode != SMS_CONSENT_REQUEST) {
                    return;
                }

                if (resultCode != Activity.RESULT_OK || data == null) {
                    rejectAndCleanup(
                        E_CONSENT_DENIED,
                        "User declined the SMS consent request",
                        null
                    );
                    return;
                }

                String message = data.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE);
                if (message == null || message.trim().isEmpty()) {
                    rejectAndCleanup(E_EMPTY_MESSAGE, "The approved SMS was empty", null);
                    return;
                }

                Promise promise = pendingPromise;
                cleanup();
                if (promise != null) {
                    WritableMap result = Arguments.createMap();
                    result.putString(RECEIVED_OTP_PROPERTY, message);
                    promise.resolve(result);
                }
            }
        };

    private void rejectAndCleanup(String code, String message, Throwable error) {
        Promise promise = pendingPromise;
        cleanup();
        if (promise == null) {
            return;
        }
        if (error == null) {
            promise.reject(code, message);
        } else {
            promise.reject(code, message, error);
        }
    }

    private void cleanup() {
        unregisterReceiver();
        pendingPromise = null;
    }

    private void unregisterReceiver() {
        if (receiverRegistered && receiver != null) {
            try {
                reactContext.unregisterReceiver(receiver);
            } catch (IllegalArgumentException ignored) {
                // Receiver was already unregistered by the system.
            }
        }
        receiverRegistered = false;
        receiver = null;
    }

    @Override
    public void invalidate() {
        cleanup();
        reactContext.removeActivityEventListener(activityEventListener);
        super.invalidate();
    }
}
