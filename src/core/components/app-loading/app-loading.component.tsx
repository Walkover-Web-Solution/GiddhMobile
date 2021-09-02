import React from 'react';

export interface ApplicationLoaderProps {
  placeholder?: (props: {loading: boolean}) => React.ReactElement;
  children: (config: any) => React.ReactElement;
}

export const AppLoading = (props: ApplicationLoaderProps): React.ReactElement => {
  const [loading, setLoading] = React.useState<boolean>(true);

  const onTasksFinish = (): void => {
    setLoading(false);
  };

  setTimeout(onTasksFinish, 1000);

  return (
    <React.Fragment>
      {!loading && props.children}
      {props.placeholder && props.placeholder({ loading })}
    </React.Fragment>
  );
};
