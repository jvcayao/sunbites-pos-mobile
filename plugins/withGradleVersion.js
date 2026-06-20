/**
 * Expo config plugin — pins Gradle to 8.10.2 and forces Java 17 for builds.
 *
 * Problem: Gradle 9.x removes deprecated React Native build APIs (hard error).
 *          Java 26 (system default) is not supported by Gradle 8.x build tools.
 * Fix:     Gradle 8.10.2 + Java 17 LTS = stable, supported, tested by Expo.
 *
 * This plugin runs during `expo prebuild` and writes both settings so any
 * developer with multiple Java versions always uses the right one.
 */
const { withGradleProperties } = require('@expo/config-plugins')
const { execSync } = require('child_process')

const GRADLE_VERSION = '8.13'
const DISTRIBUTION_URL = `https\\://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip`

function findJava17Home() {
  try {
    return execSync('/usr/libexec/java_home -v 17 2>/dev/null').toString().trim()
  } catch {
    return null
  }
}

module.exports = function withGradleVersion(config) {
  return withGradleProperties(config, (mod) => {
    mod.modResults = mod.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'distributionUrl'),
    )
    mod.modResults.push({ type: 'property', key: 'distributionUrl', value: DISTRIBUTION_URL })

    const java17Home = findJava17Home()
    if (java17Home) {
      mod.modResults = mod.modResults.filter(
        (item) => !(item.type === 'property' && item.key === 'org.gradle.java.home'),
      )
      mod.modResults.push({ type: 'property', key: 'org.gradle.java.home', value: java17Home })
    }

    return mod
  })
}
