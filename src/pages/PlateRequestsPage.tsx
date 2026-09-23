import React from 'react';
import PlateRequestTable from '../components/PlateRequestTable';
import Layout from '../components/Layout';

const PlateRequestsPage: React.FC = () => (
  <Layout pageTitle="Plate Requests">
    <PlateRequestTable />
  </Layout>
);

export default PlateRequestsPage;
