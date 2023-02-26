package com.thredwallet.app

import TBridgeActivity
import ThredMobileCore
import android.app.Activity
import android.graphics.Bitmap
import android.os.Bundle
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.fragment.app.Fragment
import de.andycandy.android.bridge.Bridge
import de.andycandy.android.bridge.CallType
import de.andycandy.android.bridge.DefaultJSInterface
import de.andycandy.android.bridge.NativeCall


class AppFragment : Fragment() {

  var app: String? = null
  var injectedSigner = ""
  var thredCore: ThredMobileCore? = null
  private var webView: WebView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    app = arguments?.getString("app")



    val signer = arguments?.getString("injectedSigner", "") as? String
    if (signer != null){
      injectedSigner = signer
    }
    thredCore = TBridgeActivity.getInstanceActivity()?.thredCore;
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    webView = getView()?.findViewById<View>(R.id.app_webview) as WebView

    if (app != null && webView != null && thredCore != null) {
      setWebViewConfig(webView as WebView, thredCore as ThredMobileCore)
      webView?.loadUrl(app as String)
    }

    var marginTop = arguments?.getInt("marginTop") as? Int
    var marginBottom = arguments?.getInt("marginBottom") as? Int

    if (marginTop == null){
      marginTop = 0
    }
    if (marginBottom == null){
      marginBottom = 0
    }

    val layout = view?.findViewById<View>(R.id.linear_layout) as? LinearLayout


    val marginTopInDp = TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP, marginTop.toFloat(), resources
        .displayMetrics
    ).toInt()

    val marginBottomInDp = TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP, marginBottom.toFloat(), resources
        .displayMetrics
    ).toInt()

    if (layout != null && marginTopInDp != null && marginBottomInDp != null){
      val params = layout.layoutParams as FrameLayout.LayoutParams

      System.out.println(marginTopInDp)
      System.out.println(marginBottomInDp)

      params.setMargins(0, marginTopInDp, 0, marginBottomInDp)
      layout.layoutParams = params
    }
  }

  private fun setWebViewConfig(webView: WebView, thredCore: ThredMobileCore){

    if (activity?.applicationContext != null){
      webView.settings.javaScriptEnabled = true
      webView.settings.domStorageEnabled = true
      webView.settings.setSupportZoom(false);
      val bridge = Bridge((activity as Activity).applicationContext, webView)
      bridge.addJSInterface(AndroidNativeInterface(thredCore))

      webView.webViewClient = object : WebViewClient() {

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
          bridge.init()
          webView?.evaluateJavascript(injectedSigner,
            ValueCallback<String?> { /* Action to perform on callback */

            })
          val requestScript = "function request(data) { return Bridge.interfaces.Android.request(data); }; window.thred_request = request;"
          webView.evaluateJavascript(requestScript,
            ValueCallback<String?> { /* Action to perform on callback */ })
        }
      }
    }
  }

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    // Inflate the layout for this fragment
    return inflater.inflate(R.layout.fragment_app, container, false)
  }

  companion object {

    fun newInstance(app: String, injectedSigner: String, margins: Map<String, Int>?) =
      AppFragment().apply {
        arguments = Bundle().apply {
          if (margins != null) {
            val top = margins["top"] as? Int
            val bottom = margins["bottom"] as? Int
            if (top != null){
              putInt("marginTop", top)
            }
            if (bottom != null){
              putInt("marginBottom", bottom)
            }
            putString("app", app)
            putString("injectedSigner", injectedSigner)
          }
        }
      }
  }
}


class AndroidNativeInterface(private val thredCore: ThredMobileCore?): DefaultJSInterface("Android") {

  @NativeCall(CallType.FULL_PROMISE)
  fun request(data: String) = doInBackground<Any?> { promise ->
    thredCore?.confirmTransaction(data){ result ->
      promise.resolve(result)
    }
  }
}
