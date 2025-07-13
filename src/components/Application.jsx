import React from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';

const Application = () => {
  return (
    <ContentLayout
      header={<Header variant="h1">Application</Header>}
    >
    </ContentLayout>
  );
};

export default Application;