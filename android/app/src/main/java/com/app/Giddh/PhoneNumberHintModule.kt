package com.app.Giddh

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import android.util.Log
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.CommonStatusCodes

/**
 * Google Identity Phone Number Hint API bridge for React Native.
 * Android-only — no runtime READ_PHONE_STATE permission required.
 */
class PhoneNumberHintModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private var pendingPromise: Promise? = null

  init {
    reactContext.addActivityEventListener(object : BaseActivityEventListener() {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
      ) {
        if (requestCode != REQUEST_CODE) {
          return
        }

        val promise = pendingPromise ?: return
        pendingPromise = null

        if (resultCode == Activity.RESULT_OK && data != null) {
          try {
            val phoneNumber = Identity.getSignInClient(activity).getPhoneNumberFromIntent(data)
            Log.d(TAG, "Phone number retrieved: $phoneNumber")
            promise.resolve(phoneNumber)
          } catch (e: Exception) {
            Log.e(TAG, "Failed to read phone number from intent", e)
            promise.reject(
              ERROR_GET_PHONE,
              "Failed to get phone number: ${e.message}",
              e
            )
          }
          return
        }

        Log.w(TAG, "Phone number hint cancelled. resultCode=$resultCode")
        promise.reject(ERROR_USER_CANCELLED, "User cancelled phone number selection")
      }
    })
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun showPhoneNumberHint(promise: Promise) {
    if (pendingPromise != null) {
      promise.reject(ERROR_ALREADY_IN_PROGRESS, "Phone number hint request already in progress")
      return
    }

    val activity = reactContext.currentActivity
    if (activity == null) {
      promise.reject(ERROR_NO_ACTIVITY, "No active Android activity available")
      return
    }

    pendingPromise = promise

    val request = GetPhoneNumberHintIntentRequest.builder().build()
    Identity.getSignInClient(activity)
      .getPhoneNumberHintIntent(request)
      .addOnSuccessListener { pendingIntent ->
        try {
          Log.d(TAG, "Launching phone number hint picker")
          activity.startIntentSenderForResult(
            pendingIntent.intentSender,
            REQUEST_CODE,
            null,
            0,
            0,
            0
          )
        } catch (e: IntentSender.SendIntentException) {
          Log.e(TAG, "Failed to launch phone number hint intent", e)
          rejectAndClear(ERROR_INTENT, "Failed to start phone number hint: ${e.message}", e)
        }
      }
      .addOnFailureListener { e ->
        Log.e(TAG, "Phone Number Hint API failure", e)
        handleApiFailure(e)
      }
  }

  private fun handleApiFailure(exception: Exception) {
    val statusCode = if (exception is ApiException) exception.statusCode else -1
    val message = exception.message ?: "Unknown failure"

    when (statusCode) {
      CommonStatusCodes.RESOLUTION_REQUIRED ->
        rejectAndClear(
          ERROR_RESOLUTION_REQUIRED,
          "Phone number hints disabled. Enable in Settings → Google → Phone number sharing.",
          exception
        )

      CommonStatusCodes.API_NOT_CONNECTED ->
        rejectAndClear(
          ERROR_API_NOT_CONNECTED,
          "Google Play Services not connected or unavailable.",
          exception
        )

      CommonStatusCodes.NETWORK_ERROR ->
        rejectAndClear(ERROR_NETWORK, "Network error occurred: $message", exception)

      CommonStatusCodes.SIGN_IN_REQUIRED ->
        rejectAndClear(ERROR_SIGN_IN_REQUIRED, "Google account sign-in required", exception)

      CommonStatusCodes.DEVELOPER_ERROR ->
        rejectAndClear(ERROR_DEVELOPER, "API configuration error: $message", exception)

      else ->
        rejectAndClear(
          ERROR_UNKNOWN,
          "Phone number hint failed: $message. Error code: $statusCode",
          exception
        )
    }
  }

  private fun rejectAndClear(code: String, message: String, throwable: Throwable? = null) {
    val promise = pendingPromise
    pendingPromise = null
    if (throwable != null) {
      promise?.reject(code, message, throwable)
    } else {
      promise?.reject(code, message)
    }
  }

  companion object {
    private const val TAG = "PhoneNumberHint"
    private const val REQUEST_CODE = 9911
    const val NAME = "PhoneNumberHint"

    const val ERROR_USER_CANCELLED = "USER_CANCELLED"
    const val ERROR_RESOLUTION_REQUIRED = "RESOLUTION_REQUIRED"
    const val ERROR_API_NOT_CONNECTED = "API_NOT_CONNECTED"
    const val ERROR_NETWORK = "NETWORK_ERROR"
    const val ERROR_SIGN_IN_REQUIRED = "SIGN_IN_REQUIRED"
    const val ERROR_DEVELOPER = "DEVELOPER_ERROR"
    const val ERROR_NO_ACTIVITY = "NO_ACTIVITY"
    const val ERROR_ALREADY_IN_PROGRESS = "ALREADY_IN_PROGRESS"
    const val ERROR_INTENT = "INTENT_ERROR"
    const val ERROR_GET_PHONE = "GET_PHONE_ERROR"
    const val ERROR_UNKNOWN = "UNKNOWN_ERROR"
  }
}
