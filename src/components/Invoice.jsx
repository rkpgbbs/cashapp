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

// Fallback sample data for invoices
const sampleInvoices = [
  {
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
  },
  {
    "Invoice_Number": "DE24464BEI",
    "Statement Number": "STM-1294-I03",
    "Statement Key": "hijk-lmno-5678",
    "Statement Type": "Invoice",
    "Invoice Date": "20-May-24",
    "Due Date": "19-Jun-24",
    "Customer number": "DELN92QWPO83",
    "Account ID": 3847569201,
    "Name": "Klixx Womblex GmbH",
    "Original Amount": 546,
    "Open Amount": 546,
    "Cur": "EUR",
    "Status": "Open",
    "Functional Amount": 546,
    "Functional Open Amount": 546,
    "FX Cur": "EUR",
    "FX Rate": 1,
    "Net Term": 30,
    "Country": "DE"
  },
  {
    "Invoice_Number": "CA24797HYT",
    "Statement Number": "STM-1295-J03",
    "Statement Key": "lmno-pqrs-9012",
    "Statement Type": "Credit Memo",
    "Invoice Date": "24-Jun-24",
    "Due Date": "",
    "Customer number": "CABN92MNBA27",
    "Account ID": 9029184756,
    "Name": "Jixxle Yazzex Corp",
    "Original Amount": -248.4,
    "Open Amount": -248.4,
    "Cur": "CAD",
    "Status": "Open",
    "Functional Amount": -248.4,
    "Functional Open Amount": -248.4,
    "FX Cur": "CAD",
    "FX Rate": 1,
    "Net Term": 60,
    "Country": "CA"
  }
];

// Sample line items
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
  const [allInvoices, setAllInvoices] = useState([]);
  const [invoiceLineItems, setInvoiceLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState('invoice-details');
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState('loading');

  // Load all invoices from JSON file
  useEffect(() => {
    console.log("Invoice: Loading invoice data");
    const loadInvoiceData = async () => {
      try {
        // Try multiple possible paths for the JSON file
        const paths = [
          './Json/Invoice.json', 
          '/Json/Invoice.json', 
          '../Json/Invoice.json',
          'Json/Invoice.json',
          window.location.origin + '/Json/Invoice.json'
        ];
        
        console.log("Invoice: Will try these paths:", paths);
        let data = null;
        
        for (const path of paths) {
          try {
            console.log(`Invoice: Attempting to fetch from ${path}`);
            const response = await fetch(path);
            console.log(`Invoice: Fetch response status: ${response.status}`);
            
            if (response.ok) {
              data = await response.json();
              console.log(`Invoice: Successfully loaded invoice data from ${path}, found ${data.length} records`);
              setDataSource('json');
              break;
            }
          } catch (e) {
            console.log(`Invoice: Failed to load from ${path}: ${e.message}`);
          }
        }
        
        if (data && data.length > 0) {
          console.log("Invoice: Setting real data from JSON");
          setAllInvoices(data);
        } else {
          // Fallback to sample data if JSON can't be loaded
          console.warn('Invoice: Using fallback sample data');
          setAllInvoices(sampleInvoices);
          setDataSource('sample');
        }
      } catch (error) {
        console.error('Invoice: Error loading invoice data:', error);
        // Fallback to sample data
        setAllInvoices(sampleInvoices);
        setDataSource('sample');
      }
    };

    loadInvoiceData();
  }, []);

  // Find specific invoice based on URL parameter
  useEffect(() => {
    if (allInvoices.length === 0) {
      console.log("Invoice: No invoices loaded yet, waiting...");
      return;
    }
    
    console.log(`Invoice: Finding invoice from ${allInvoices.length} loaded invoices`);
    setLoading(true);
    
    const params = new URLSearchParams(location.search);
    const invoiceNumber = params.get('invoice_number');
    console.log(`Invoice: Looking for invoice number: ${invoiceNumber}`);
    
    let selectedInvoice;
    if (invoiceNumber) {
      selectedInvoice = allInvoices.find(inv => inv.Invoice_Number === invoiceNumber);
      console.log(`Invoice: Found matching invoice: ${selectedInvoice ? 'Yes' : 'No'}`);
    }
    
    // If no invoice found or no invoice number provided, use the first one
    if (!selectedInvoice) {
      selectedInvoice = allInvoices[0];
      console.log(`Invoice: Using first invoice: ${selectedInvoice.Invoice_Number}`);
      
      // Update URL to reflect the selected invoice
      navigate(`/invoice?invoice_number=${selectedInvoice.Invoice_Number}`, { replace: true });
    }
    
    console.log(`Invoice: Setting selected invoice: ${selectedInvoice.Invoice_Number}`);
    setInvoiceData(selectedInvoice);
    setInvoiceLineItems(sampleLineItems); // In the future, load real line items
    document.title = `Invoice ${selectedInvoice.Invoice_Number}`;
    setLoading(false);
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
          <Box fontSize="heading-xl" fontWeight="bold">
            Invoice {dataSource === 'sample' ? "(Sample Data)" : ""}
          </Box>
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
  }, [invoiceData, dataSource]);

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