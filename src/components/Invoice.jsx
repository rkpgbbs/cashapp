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
import { generateClient } from 'aws-amplify/api';

// Create API client
const client = generateClient();

// Column definitions (no changes needed here)
const invoiceHeaderColumns = [
  { id: 'StatementType', header: 'Statement Type', cell: (item) => item.statementType, width: '10%' },
  { id: 'invoiceDate', header: 'Invoice Date', cell: (item) => item.invoiceDate, width: '12%' },
  { id: 'dueDate', header: 'Due Date', cell: (item) => item.dueDate, width: '15%' },
  { id: 'originalAmount', header: 'Original Amount', cell: (item) => item.originalAmount, width: '15%' },
  { id: 'openAmount', header: 'Open Amount', cell: (item) => item.openAmount, width: '12%' },
  { id: 'currency', header: 'Cur', cell: (item) => item.currency, width: '8%' },
  { id: 'functionalAmount', header: 'Functional Amount', cell: (item) => item.functionalAmount, width: '13%' },
  { id: 'functionalOpenAmount', header: 'Functional Open Amount', cell: (item) => item.functionalOpenAmount, width: '15%' },
  { id: 'fxCur', header: 'Fx Cur', cell: (item) => item.fxCur, width: '8%' },
  { id: 'fxRate', header: 'Fx Rate', cell: (item) => item.fxRate, width: '8%' },
];

const invoiceLineColumns = [
  { id: 'lineNumber', header: 'Line Number', cell: (item) => item.line_number, width: '8%' },
  { id: 'orderNumber', header: 'Order Number', cell: (item) => item.order_number, width: '12%' },
  { id: 'productDescription', header: 'Product Description', cell: (item) => item.product_description, width: '20%' },
  { id: 'quantity', header: 'Quantity', cell: (item) => item.quantity, width: '8%' },
  { id: 'unitPrice', header: 'Unit Price', cell: (item) => item.unit_price, width: '10%' },
  { id: 'principalAmount', header: 'Principal Amount', cell: (item) => item.principalAmount, width: '12%' },
  { id: 'discount', header: 'Discount', cell: (item) => item.discount, width: '10%' },
  { id: 'tax', header: 'Tax', cell: (item) => item.tax, width: '10%' },
  { id: 'shippingCharge', header: 'Shipping Charge', cell: (item) => item.shippingCharge, width: '10%' },
];

// Sample line items (we'll replace this with real data later)
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

// GraphQL queries
const listInvoicesQuery = `
  query ListInvoices {
    listInvoices {
      items {
        Invoice_Number
        statementNumber
        statementKey
        statementType
        invoiceDate
        dueDate
        originalAmount
        openAmount
        currency
        status
        customerNumber
        accountID
        customerName
        country
        netTerm
      }
    }
  }
`;

const getInvoiceQuery = `
  query GetInvoice($Invoice_Number: String!) {
    getInvoice(Invoice_Number: $Invoice_Number) {
      Invoice_Number
      statementNumber
      statementKey
      statementType
      invoiceDate
      dueDate
      originalAmount
      openAmount
      currency
      status
      customerNumber
      accountID
      customerName
      country
      netTerm
    }
  }
`;

const Invoice = () => {
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(null);
  const [allInvoices, setAllInvoices] = useState([]);
  const [invoiceLineItems, setInvoiceLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState('invoice-details');
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Load all invoices from DynamoDB
  useEffect(() => {
    const fetchInvoices = async () => {
	try {
		console.log("Fetching all invoices from API...");
		const response = await client.graphql({
			query: listInvoicesQuery
		});
		
		const invoices = response.data.listInvoices.items;
		console.log(`Fetched ${invoices.length} invoices from API`);
		setAllInvoices(invoices);
	} catch (error) {
		console.error("Error fetching invoices:", error);
		console.error('Invoice fetchAll Error details:', JSON.stringify(error, null, 2));
		setError(error);
	}

    };

    fetchInvoices();
  }, []);

  // Find specific invoice based on URL parameter
  useEffect(() => {
    if (allInvoices.length === 0) return;
    
    const fetchInvoiceDetails = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const invoiceNumber = params.get('invoice_number');
      console.log(`Looking for invoice: ${invoiceNumber}`);
      
	try {
		let selectedInvoice;
		
		if (invoiceNumber) {
			// Fetch specific invoice from API
			const response = await client.graphql({
				query: getInvoiceQuery,
				variables: { Invoice_Number: invoiceNumber }
			});
			
			selectedInvoice = response.data.getInvoice;
			console.log("Fetched invoice details:", selectedInvoice);
		}
		
		// If no invoice found or no invoice number provided, use the first one
		if (!selectedInvoice) {
			selectedInvoice = allInvoices[0];
			console.log("Using first invoice:", selectedInvoice);
			// Update URL to reflect the selected invoice
			navigate(`/invoice?invoice_number=${selectedInvoice.Invoice_Number}`, { replace: true });
		}
		
		setInvoiceData(selectedInvoice);
		setInvoiceLineItems(sampleLineItems);
		document.title = `Invoice ${selectedInvoice.Invoice_Number}`;
	} catch (error) {
		console.error("Error fetching invoice details:", error);
		console.error('Invoice specific Error details:', JSON.stringify(error, null, 2));
		setError(error);
	}
 finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [allInvoices, location.search, navigate]);

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
            Invoice_Number: {invoiceData.Invoice_Number} | Statement_Number: {invoiceData.statementNumber} | Statement_Key: {invoiceData.statementKey}
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
              <Box variant="p">{invoiceData.customerNumber}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Customer Name</Box>
              <Box variant="p">{invoiceData.customerName}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Account ID</Box>
              <Box variant="p">{invoiceData.accountID}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Country</Box>
              <Box variant="p">{invoiceData.country}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Status</Box>
              <Box variant="p">{invoiceData.status}</Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Net Term</Box>
              <Box variant="p">{invoiceData.netTerm}</Box>
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

  if (error) {
    return (
      <Box textAlign="center" padding={{ top: 'xxxl' }}>
        <Box variant="h3" padding={{ top: 'l' }} color="text-status-error">
          Error loading data: {error.message}
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
