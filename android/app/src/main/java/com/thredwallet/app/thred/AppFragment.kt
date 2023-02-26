import android.annotation.SuppressLint
import android.app.Activity
import android.app.Activity.RESULT_OK
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import com.thredwallet.app.R
import de.andycandy.android.bridge.Bridge
import de.andycandy.android.bridge.CallType
import de.andycandy.android.bridge.DefaultJSInterface
import de.andycandy.android.bridge.NativeCall


class AppFragment : Fragment() {

  var app: String? = null
  var injectedSigner = ""
  private var thredCore: ThredMobileCore? = null
  private var webView: WebView? = null
  private var mUploadMessage: ValueCallback<Array<Uri>>? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    app = arguments?.getString("app")



    val signer = arguments?.getString("injectedSigner", "")
    if (signer != null){
      injectedSigner = signer
    }
    thredCore = TBridgeActivity.getInstanceActivity()?.thredCore

  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    webView = view.findViewById<View>(R.id.app_webview) as WebView
    TBridgeActivity.getInstanceActivity()?.setButtonClick()

    if (app != null && webView != null && thredCore != null) {
      setWebViewConfig(webView as WebView, thredCore as ThredMobileCore)
      webView?.loadUrl(app as String)
    }

    var marginTop = arguments?.getInt("marginTop")
    var marginBottom = arguments?.getInt("marginBottom")

    if (marginTop == null){
      marginTop = 0
    }
    if (marginBottom == null){
      marginBottom = 0
    }

    val layout = view.findViewById<View>(R.id.linear_layout) as? LinearLayout


    val marginTopInDp = TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP, marginTop.toFloat(), resources
        .displayMetrics
    ).toInt()

    val marginBottomInDp = TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP, marginBottom.toFloat(), resources
        .displayMetrics
    ).toInt()

    if (layout != null){
      val params = layout.layoutParams as FrameLayout.LayoutParams

      params.setMargins(0, marginTopInDp, 0, marginBottomInDp)
      layout.layoutParams = params
    }
  }

  @SuppressLint("SetJavaScriptEnabled")
  private fun setWebViewConfig(webView: WebView, thredCore: ThredMobileCore){

    if (activity?.applicationContext != null){
      webView.settings.javaScriptEnabled = true
      webView.settings.domStorageEnabled = true
      webView.settings.setSupportZoom(false)
      val bridge = Bridge((activity as Activity).applicationContext, webView)
      bridge.addJSInterface(AndroidNativeInterface(thredCore))

      webView.webViewClient = object : WebViewClient() {

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
          bridge.init()
          webView.evaluateJavascript(injectedSigner
          ) { /* Action to perform on callback */

          }
          val requestScript = "function request(data) { return Bridge.interfaces.Android.request(data); }; window.thred_request = request;"
          webView.evaluateJavascript(requestScript
          ) { /* Action to perform on callback */ }
        }
      }

      webView.settings.allowContentAccess = true
      webView.settings.allowFileAccess = true
      webView.settings.domStorageEnabled = true
      webView.webChromeClient = object: WebChromeClient() {
        override fun onShowFileChooser(
          mWebView: WebView?,
          filePathCallback: ValueCallback<Array<Uri>>?,
          fileChooserParams: FileChooserParams?
        ): Boolean {
          if (mUploadMessage != null) {
            mUploadMessage!!.onReceiveValue(null)
            mUploadMessage = null
          }
          mUploadMessage = filePathCallback
          val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT)
          contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE)
          contentSelectionIntent.type = "*/*"
          val intent = Intent(Intent.ACTION_CHOOSER)
          intent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
          intent.putExtra(Intent.EXTRA_TITLE, "File Chooser")
          try {
            getFileResultLauncher.launch(intent)
          } catch (e: ActivityNotFoundException) {
            mUploadMessage = null

            return false
          }
          return true
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
            val top = margins["top"]
            val bottom = margins["bottom"]
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

  val getFileResultLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
  ) {
      ar: ActivityResult ->
    val intent: Intent? = ar.data
    val result = if (intent == null || ar.resultCode != RESULT_OK) null else arrayOf(Uri.parse(intent.dataString))
    mUploadMessage!!.onReceiveValue(result)
    mUploadMessage = null
  }
}


class AndroidNativeInterface(private val thredCore: ThredMobileCore?): DefaultJSInterface("Android") {

  @NativeCall(CallType.FULL_PROMISE)
  fun request(data: String) = doInBackground { promise ->
    thredCore?.confirmTransaction(data){ result ->
      promise.resolve(result)
    }
  }
}
