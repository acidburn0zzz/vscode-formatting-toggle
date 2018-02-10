import { commands, ExtensionContext, StatusBarItem, Disposable } from 'vscode'
import {
  COMMAND_NAME,
  FORMATTING_SETTINGS,
  CONFIGURATION_TARGET
} from './constants'
import getEditorConfiguration from './helpers/getEditorConfiguration'
import getStatusBarText from './helpers/getStatusBarText'
import { FormattingConfiguration } from './helpers/getFormattingConfiguration'

const initCommand = (
  extensionContext: ExtensionContext,
  statusBar: StatusBarItem
): Disposable =>
  commands.registerCommand(`extension.${COMMAND_NAME}`, () => {
    const editorConfiguration = getEditorConfiguration()
    const shouldDisable: boolean = extensionContext.globalState.get(
      'TOGGLE_STATUS',
      false
    )
    const savedConfiguration: FormattingConfiguration = extensionContext.globalState.get(
      'SAVED_CONFIGURATION',
      {} as FormattingConfiguration
    )

    // Updating the configuration will trigger 3 `onDidChangeConfiguration`
    // events. We need to ignore those to not unnecessarily toggle the status
    // bar text.
    extensionContext.globalState.update(
      'SHOULD_IGNORE_CONFIGURATION_CHANGES',
      true
    )

    FORMATTING_SETTINGS.forEach(setting => {
      if (shouldDisable) {
        return editorConfiguration.update(setting, false, CONFIGURATION_TARGET)
      }

      // `formatOnType` should only be toggled on if the user had enabled it
      // beforehand.
      if (setting === 'formatOnType') {
        const initialValue = savedConfiguration[setting]
        return editorConfiguration.update(
          setting,
          initialValue,
          CONFIGURATION_TARGET
        )
      }

      // The other formatting settings are *probably* safe to be toggled on.
      return editorConfiguration.update(setting, true, CONFIGURATION_TARGET)
    })

    extensionContext.globalState.update('TOGGLE_STATUS', !shouldDisable)
    statusBar.text = getStatusBarText(!shouldDisable)
  })

export default initCommand