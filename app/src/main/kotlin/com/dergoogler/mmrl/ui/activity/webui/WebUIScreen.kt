package com.dergoogler.mmrl.ui.activity.webui

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.net.toUri
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.webkit.WebViewAssetLoader
import com.dergoogler.mmrl.R
import com.dergoogler.mmrl.ui.providable.LocalUserPreferences
import com.dergoogler.mmrl.viewmodel.WebUIViewModel
import dev.dergoogler.mmrl.compat.core.MMRLUriHandlerImpl
import java.io.File


@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebUIScreen(
    modId: String,
    viewModel: WebUIViewModel = hiltViewModel(),
) {
    val context = LocalContext.current
    val userPrefs = LocalUserPreferences.current
    val density = LocalDensity.current
    val browser = LocalUriHandler.current as MMRLUriHandlerImpl
    val colorScheme = MaterialTheme.colorScheme
    val typography = MaterialTheme.typography

    val rootShell = viewModel.createRootShell(
        globalMnt = true,
        devMode = userPrefs.developerMode
    )

    WebView.setWebContentsDebuggingEnabled(userPrefs.developerMode)

    val moduleDir = "/data/adb/modules/$modId"
    val webRoot = File("$moduleDir/webroot")
    val domainSafeRegex = Regex("^https?://mui\\.kernelsu\\.org(/.*)?$")

    var topInset by remember { mutableIntStateOf(0) }
    var bottomInset by remember { mutableIntStateOf(0) }

    val webViewAssetLoader = WebViewAssetLoader.Builder()
        .setDomain("mui.kernelsu.org")
        .addPathHandler(
            "/",
            SuFilePathHandler(
                context,
                webRoot,
                rootShell
            )
        )

    AndroidView(
        factory = {
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )

                ViewCompat.setOnApplyWindowInsetsListener(this) { _, insets ->
                    val inset = insets.getInsets(WindowInsetsCompat.Type.systemBars())
                    topInset = (inset.top / density.density).toInt()
                    bottomInset = (inset.bottom / density.density).toInt()

                    webViewAssetLoader.addPathHandler(
                        "/mmrl/",
                        MMRLWebUIHandler(
                            topInset = topInset,
                            bottomInset = bottomInset,
                            colorScheme = colorScheme,
                            typography = typography
                        )
                    )

                    WindowInsetsCompat.CONSUMED;
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        view: WebView,
                        request: WebResourceRequest?,
                    ): Boolean {
                        val mUrl = request?.url?.toString() ?: return false

                        return if (!domainSafeRegex.matches(mUrl)) {
                            browser.openUri(
                                uri = mUrl,
                                onSuccess = { intent, uri ->
                                    intent.launchUrl(context, uri.toUri())
                                    Toast.makeText(
                                        context,
                                        context.getString(R.string.unsafe_url_redirecting, uri),
                                        Toast.LENGTH_SHORT
                                    ).show()
                                }
                            )
                            true
                        } else {
                            view.loadUrl(mUrl)
                            false
                        }
                    }

                    override fun shouldInterceptRequest(
                        view: WebView,
                        request: WebResourceRequest,
                    ): WebResourceResponse? {
                        return webViewAssetLoader.build().shouldInterceptRequest(request.url)
                    }
                }

            }
        }, update = { webview ->
            webview.settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = false
            }
            webview.apply {
                addJavascriptInterface(
                    WebViewInterface(
                        context,
                        this,
                        moduleDir,
                        viewModel,
                        userPrefs
                    ), "ksu"
                )
                loadUrl("https://mui.kernelsu.org/index.html")
            }
        }
    )
}