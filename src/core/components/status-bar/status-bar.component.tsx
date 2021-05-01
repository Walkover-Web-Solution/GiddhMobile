import React from 'react';
import {StatusBar as RNStatusBar, StatusBarProps as RNStatusBarProps, ViewProps} from 'react-native';
import {StyledComponentProps} from '@ui-kitten/components';

export type StatusBarProps = RNStatusBarProps & StyledComponentProps;

export default class StatusBarComponent extends React.Component<StatusBarProps> {
  static styledComponentName: string = 'StatusBar';

  public render(): React.ReactElement<ViewProps> {
    const {...statusBarProps} = this.props;

    return <RNStatusBar {...statusBarProps} />;
  }
}
