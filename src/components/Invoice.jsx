import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Spinner from '@cloudscape-design/components/spinner';
import Tabs from '@cloudscape-design/components/tabs';

// Column definitions (no changes needed here)
const invoiceHeaderColumns = [
  { id: 'StatementType', header: 'Statement Type', cell: (item) => item["Statement Type"], width: '10%' },
  { id: 'invoiceDate', header: 'Invoice Date', cell: (item) => item["Invoice Date"], width: '12%' },
  { id: 'dueDate', header: 'Due Date', cell: (item) => item["Due Date"], width: '15%' },
  { id: 'originalAmount', header: 'Original Amount', cell: (item) => item["Original Amount"], width: '15%' },
  { id: 'openAmount', header: 'Open Amount', cell: (item) => item["Open Amount"], width: '12%' },
  { id: 'currency', header: 'Cur', cell: (item) => item["Cur"], width: '8%' },
  { id: 'functionalAmount', header: 'Functional Amount', cell: (item) => item["Functional Amount"], width: '13%' },
  { id: 'functionalOpenAmount', header: 'Functional Open Amount', cell: (item) => item["Functional Open Amount"], width: '15%' },
  { id: 'fxCur', header: 'Fx Cur', cell: (item) => item["FX Cur"], width: '8%' },
  { id: 'fxRate', header: 'Fx Rate', cell: (item) => item["FX Rate"], width: '8%' },
];

const invoiceLineColumns = [
  { id: 'lineNumber', header: 'Line Number', cell: (item) => item.line_number, width: '8%' },
  { id: 'orderNumber', header: 'Order Number', cell: (item) => item.order_number, width: '12%' },
  { id: 'productDescription', header: 'Product Description', cell: (item) => item.product_description, width: '20%' },
  { id: 'quantity', header: 'Quantity', cell: (item) => item.quantity, width: '8%' },
  { id: 'unitPrice', header: 'Unit Price', cell: (item) => item.unit_price, width: '10%' },
  { id: 'principalAmount', header: 'Principal Amount', cell: (item) => item["Principal Amount"], width: '12%' },
  { id: 'discount', header: 'Discount', cell: (item) => item["Discount"], width: '10%' },
  { id: 'tax', header: 'Tax', cell: (item) => item["Tax"], width: '10%' },
  { id: 'shippingCharge', header: 'Shipping Charge', cell: (item) => item["Shipping Charge"], width: '10%' },
];

// Sample data for development
const sampleInvoiceData = {
  "Invoice_Number": "FR24131AEI",
  "Statement Number": "STM-1293-H03",
  "Statement Key": "defg-hijk-1234",
  "Statement Type": "Invoice",
  "Invoice Date": "15-Apr-24",
  "Due Date": "14-Jun-24",
  "Customer number": "FRTS63KMPA22",
  "Account ID": 2837465928,
  "Name": "Vixor Jabbix SARL",
  "Original Amount": 591.36,
  "Open Amount": 591.36,
  "Cur": "EUR",
  "Status": "Open",
  "Functional Amount": 591.36,
  "Functional Open Amount": 591.36,
  "FX Cur": "EUR",
  "FX Rate": 1,
  "Net Term": 60,
  "Country": "FR"
};

const sampleLineItems = [
  {
    "line_number": 1,
    "order_number": "ORD-061-1",
    "product_description": "Premium Service Package",
    "quantity": 2,
    "unit_price": 250,
    "Principal Amount": 500,
    "Discount": -15,
    "Tax": 10,
    "Shipping Charge": 5
  },
  {
    "line_number": 2,
    "order_number": "ORD-061-2",
    "product_description": "Maintenance Contract",
    "quantity": 1,
    "unit_price": 28,
    "Principal Amount": 28,
    "Discount": -0.84,
    "Tax": 0.56,
    "Shipping Charge": 0
  }
];

const Invoice = () => {
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLineItems, setInvoiceLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState('invoice-details');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoiceData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Use sample data for now - this will be replaced with Amplify API calls later
        setInvoiceData(sampleInvoiceData);
        setInvoiceLineItems(sampleLineItems);
        
        // Update document title
        document.title = `Invoice ${sampleInvoiceData.Invoice_Number}`;
        
        // Update URL if needed
        const params = new URLSearchParams(location.search);
        const invoiceNumber = params.get('invoice_number');
        if (!invoiceNumber) {
          navigate(`/invoice?invoice_number=${sampleInvoiceData.Invoice_Number}`, { replace: true });
        }
        
        setLoading(false);
      }, 1000);
    };

    fetchInvoiceData();
  }, [location.search, navigate]);

  const headerComponent = useMemo(() => {
    if (!invoiceData) {
      return (
        <Header variant="h1">
          <SpaceBetween direction="horizontal" size="l">
            <Box fontSize="heading-xl" fontWeight="bold">Invoice</Box>
            <Spinner />
          </SpaceBetween>
        </Header>
      );
    }
    
    return (
      <Header variant="h1">
        <SpaceBetween direction="horizontal" size="l">
          <Box fontSize="heading-xl" fontWeight="bold">Invoice</Box>
          <Box 
            fontSize="heading-l"
            fontWeight="normal"
            display="flex"
            alignItems="center"
            padding={{ top: "xs" }}
          >
            Invoice_Number: {invoiceData.Invoice_Number} | Statement_Number: {invoiceData["Statement Number"]} | Statement_Key: {invoiceData["Statement Key"]}
          </Box>
        </SpaceBetween>
      </Header>
    );
  }, [invoiceData]);

  const customerInfoComponent = useMemo(() => {
    if (!invoiceData) return null;
    
    return (
      <Container header={<Header variant="h2">Customer Information</Header>}>
        <SpaceBetween size="l">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <Box variant="awsui-key-label">Customer Number</Box>
              <Box variant="p">{invoiceData["Customer number"]}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Customer Name</Box>
              <Box variant="p">{invoiceData.Name}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Account ID</Box>
              <Box variant="p">{invoiceData["Account ID"]}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Country</Box>
              <Box variant="p">{invoiceData.Country}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Status</Box>
              <Box variant="p">{invoiceData.Status}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Net Term</Box>
              <Box variant="p">{invoiceData["Net Term"]}</Box>
            </div>
          </div>
        </SpaceBetween>
      </Container>
    );
  }, [invoiceData]);

  if (loading) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Spinner size="large" />
        <Box variant="h3" padding={{ top: 'l' }}>
          Loading invoice data...
        </Box>
      </Box>
    );
  }

  return (
    <ContentLayout header={headerComponent}>
      <SpaceBetween size="l">
        {customerInfoComponent}
        
        <Tabs
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={[
            {
              id: 'invoice-details',
              label: 'Invoice Details',
              content: (
                <Table
                  columnDefinitions={invoiceHeaderColumns}
                  items={invoiceData ? [invoiceData] : []}
                  stripedRows
                  wrapLines
                  stickyHeader
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>No invoice data</b>
                      <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                        No invoice data to display.
                      </Box>
                    </Box>
                  }
                />
              )
            },
            {
              id: 'line-items',
              label: 'Line Items',
              content: (
                <Table
                  columnDefinitions={invoiceLineColumns}
                  items={invoiceLineItems}
                  stripedRows
                  wrapLines
                  stickyHeader
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>No line items</b>
                      <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                        No line items to display for this invoice.
                      </Box>
                    </Box>
                  }
                />
              )
            }
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
};

export default Invoice;