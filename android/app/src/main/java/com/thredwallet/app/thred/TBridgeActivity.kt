import android.R
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.animation.TranslateAnimation
import android.widget.FrameLayout
import androidx.annotation.IdRes
import androidx.core.view.WindowCompat
import androidx.fragment.app.Fragment
import com.getcapacitor.BridgeActivity
import com.thredwallet.app.AppFragment
import java.lang.ref.WeakReference

open class TBridgeActivity : BridgeActivity() {
  var thredCore: ThredMobileCore? = null
  private var existingFragment: AppFragment? = null
  var fragmentFrame: FrameLayout? = null

  companion object {
    var weakActivity: WeakReference<TBridgeActivity>? = null

    fun getInstanceActivity(): TBridgeActivity? {

      return weakActivity?.get()
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    registerPlugin(ThredMobileCore::class.java)

    super.onCreate(savedInstanceState)

    thredCore = bridge.getPlugin("ThredMobileCore").instance as ThredMobileCore
    weakActivity = WeakReference(this@TBridgeActivity)

    WindowCompat.setDecorFitsSystemWindows(window, false)
    setFragmentFrame()
  }

  private fun setFragmentFrame(){

    val rootLayout = findViewById<ViewGroup>(R.id.content)

    val layout = fragmentFrame()

    fragmentFrame = layout

    rootLayout.addView(layout)

  }

  private fun newAppFragment(app: String, signer: String, margins: Map<String, Int>?){
    val frag = AppFragment.newInstance(app, signer, margins)

    addFragment(frag)

    existingFragment = frag
  }

  private fun fragmentFrame(): FrameLayout {
    val layout = FrameLayout(this)
    layout.id = View.generateViewId()
    val params = FrameLayout.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.MATCH_PARENT,
      Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL
    )
    layout.layoutParams = params

    return layout
  }

  fun toggleAppVisibility(toggle: Int, app: String?, signer: String?, margins: Map<String, Int>?){

    if (toggle == 1 && app != null && signer != null) {
      newAppFragment(app, signer, margins)
      if (fragmentFrame as? FrameLayout != null){
        slideUp(fragmentFrame as FrameLayout)
      }
    } else if (toggle == 2){
      if (fragmentFrame as? FrameLayout != null) {
        slideDown(fragmentFrame as FrameLayout)
      }
      removeFragments()
    }
    else if (toggle == 3){
      if (existingFragment as? AppFragment != null){
        showFragment(existingFragment as AppFragment)
      }
    }
    else if(toggle == 4){
      if (existingFragment as? AppFragment != null){
        hideFragment(existingFragment as AppFragment)
      }
    }
  }

  private fun addFragment(
    fragment: Fragment,
  ) {
    val frame = fragmentFrame as? FrameLayout
    if (frame != null){
      frame?.visibility = View.VISIBLE
      supportFragmentManager
        .beginTransaction()
        .add(frame.id, fragment)
        .disallowAddToBackStack()
        .commit()
    }
  }

  // slide the view from below itself to the current position
  private fun slideUp(view: FrameLayout) {
    view.visibility = View.VISIBLE
    val animate = TranslateAnimation(
      0f,  // fromXDelta
      0f,  // toXDelta
      view.height.toFloat(),  // fromYDelta
      0f
    ) // toYDelta
    animate.duration = 200
    animate.fillAfter = true
    view.startAnimation(animate)
  }

  // slide the view from its current position to below itself
  private fun slideDown(view: FrameLayout) {
    val animate = TranslateAnimation(
      0f,  // fromXDelta
      0f,  // toXDelta
      0f,  // fromYDelta
      view.height.toFloat()
    ) // toYDelta
    animate.duration = 200
    animate.fillAfter = true
    view.startAnimation(animate)
  }

  fun replaceFragment(
    @IdRes containerViewId: Int,
    fragment: Fragment,
    fragmentTag: String,
    backStackStateName: String?
  ) {
    supportFragmentManager
      .beginTransaction()
      .replace(containerViewId, fragment, fragmentTag)
      .addToBackStack(backStackStateName)
      .commit()
  }

  private fun hideFragment(fragment: Fragment){

    supportFragmentManager.beginTransaction().hide(fragment).commit()
  }

  private fun showFragment(fragment: Fragment){
    supportFragmentManager.beginTransaction().show(fragment).commit()
  }

  private fun removeFragments() {
    val frame = fragmentFrame as? FrameLayout
    frame?.visibility = View.GONE
    existingFragment = null

    supportFragmentManager.popBackStackImmediate()
  }
}
