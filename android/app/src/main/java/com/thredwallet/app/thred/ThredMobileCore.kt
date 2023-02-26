import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.*

@CapacitorPlugin(name = "ThredMobileCore")
class ThredMobileCore : Plugin() {

  val handlers = mutableMapOf<String, (result: Any?) -> Unit>()

  @PluginMethod
  fun sendResponse(call: PluginCall) {

    val id = call.getString("id")
    val data = call.getString("data")

    val handler = handlers[id]

    if (handler != null){
      handler(data)
      handlers.remove(id)
    }
  }

  @PluginMethod
  fun openApp(call: PluginCall) {

    val signer = call.getString("signer")
    val data: JSObject = call.getObject("app")
    val margins: JSObject = call.getObject("margins")
    val app = data.getString("loadURL")

    //open app controller


    if (app != null && signer != null){
      var topMargin = margins.getInteger("top")
      var bottomMargin = margins.getInteger("bottom")

      if (topMargin == null){
        topMargin = 0
      }
      if (bottomMargin == null){
        bottomMargin = 0
      }

      val appMargins = mutableMapOf<String, Int>()
      appMargins["bottom"] = bottomMargin
      appMargins["top"] = topMargin

      TBridgeActivity.getInstanceActivity()?.toggleAppVisibility(1, app, signer, appMargins)
    }
  }

  @PluginMethod
  fun setWallet(call: PluginCall?) {
  }

  @PluginMethod
  fun getWallet(call: PluginCall?) {
  }

  @PluginMethod
  fun toggleAppVisible(call: PluginCall) {
    val show = call.getBoolean("visible")
    val toggle: Int?
    if (show != null){
      toggle = if (show){
        3
      } else{
        4
      }
      TBridgeActivity.getInstanceActivity()?.toggleAppVisibility(toggle, null, null, null)
    }
  }

  fun confirmTransaction(txData: String, replyHandler: (result: Any?) -> Unit){

    val uuid = UUID.randomUUID().toString()

    handlers[uuid] = replyHandler

    val ret = JSObject()
    ret.put("request", txData)
    ret.put("id", uuid)

    notifyListeners("newTransaction", ret)
  }
}
