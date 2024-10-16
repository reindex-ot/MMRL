package ext.dergoogler.mmrl.ext

import java.nio.file.FileSystems
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.io.path.nameWithoutExtension


/**
 * Finds the first file in the given directory that matches the given glob pattern.
 * @param   prefix
 *          what the file should starts with
 * @param   patterns
 *          what should be searched for. Default is `*.apk`, `*.jar`, `*.dex`
 *
 * @return  a new `Path` object
 */
fun String.findFileGlob(
    prefix: String, vararg patterns: String = arrayOf("*.apk", "*.jar", "*.dex")
): Path? {
    val dirPath: Path = Paths.get(this)

    Files.newDirectoryStream(dirPath).use { directoryStream ->
        for (path in directoryStream) {
            for (pattern in patterns) {
                val pathMatcher = FileSystems.getDefault().getPathMatcher("glob:$pattern")
                if (pathMatcher.matches(path.fileName) && path.fileName.nameWithoutExtension == prefix) {
                    return path
                }
            }
        }
    }

    return null
}