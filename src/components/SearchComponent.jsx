import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Autosuggest from '@cloudscape-design/components/autosuggest';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { generateClient } from 'aws-amplify/api';

// Create API client
const client = generateClient();

// Search dropdown options
const searchOptions = [
    { label: 'All', value: 'all' },
    { label: 'Invoice', value: 'invoice' },
    { label: 'Receipt', value: 'receipt' },
    { label: 'Customer', value: 'customer' },
    { label: 'Order', value: 'order' },
    { label: 'Credit Memo', value: 'credit_memo' },
];

// GraphQL query
const listInvoicesQuery = `
  query ListInvoices {
    listInvoices {
      items {
        Invoice_Number
        Statement_Number
        Name
        Customer_Number
        Account_ID
        Order_Number
      }
    }
  }
`;


const SearchComponent = ({ searchDropdown, setSearchDropdown }) => {
    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [invoiceData, setInvoiceData] = useState([]);
    const navigate = useNavigate();

    // Load invoice data from API
    useEffect(() => {
        const fetchInvoiceData = async () => {
			try {
				console.log("SearchComponent: Fetching invoices from API");
				const response = await client.graphql({
					query: listInvoicesQuery
				});
				
				const invoices = response.data.listInvoices.items;
				console.log(`SearchComponent: Fetched ${invoices.length} invoices`);
				setInvoiceData(invoices);
			} catch (error) {
				console.error('SearchComponent: Error loading invoice data:', error);
				console.error('SearchComponent Error details:', JSON.stringify(error, null, 2));
			}

        };

        fetchInvoiceData();
    }, []);

    // Filter suggestions based on search input and selected category
    const filterSuggestions = (value) => {
        if (!value || value.length < 2 || !invoiceData.length) return [];

        const searchType = searchDropdown.value;
        const lowercasedValue = value.toLowerCase();

        return invoiceData
            .filter(item => {
if (searchType === 'all') {
    return (
        item.Invoice_Number?.toLowerCase().includes(lowercasedValue) ||
        item.Name?.toLowerCase().includes(lowercasedValue) ||
        item.Statement_Number?.toLowerCase().includes(lowercasedValue) ||
        item.Order_Number?.toLowerCase().includes(lowercasedValue)
    );
}

                return false;
            })
            .slice(0, 10) // Limit to 10 suggestions
	.map(item => ({
    value: item.Invoice_Number,
    label: `${item.Invoice_Number} | Customer: ${item.Name} | Cust#: ${item.Customer_Number} | Acc: ${item.Account_ID} | Order#: ${item.Order_Number}`,
}));


    };

    const handleSearchChange = (event) => {
        const value = event.detail.value;
        setSearchValue(value);
        setSuggestions(filterSuggestions(value));
    };

    const handleSearchSelect = (event) => {
        const selectedInvoiceNumber = event.detail.value;
        navigate(`/invoice?invoice_number=${selectedInvoiceNumber}`);
        setSearchValue('');
        setSuggestions([]);
    };

    const handleSearchTypeChange = (event) => {
        setSearchDropdown(event.detail.selectedOption);
        setSuggestions(filterSuggestions(searchValue));
    };

    return (
        <div style={{ display: 'flex', minWidth: '400px', padding: '5px' }}>
            <SpaceBetween direction="horizontal" size="xs">
                <Select
                    selectedOption={searchDropdown}
                    onChange={handleSearchTypeChange}
                    options={searchOptions}
                    ariaLabel="Search type"
                />
                <div style={{ flexGrow: 1, minWidth: '300px' }}>
                    <Autosuggest
                        value={searchValue}
                        onChange={handleSearchChange}
                        onSelect={handleSearchSelect}
                        options={suggestions}
                        placeholder="Search..."
                        ariaLabel="Search"
                        empty="No matches found"
                        enteredTextLabel={value => `Search for "${value}"`}
                    />
                </div>
            </SpaceBetween>
        </div>
    );
};

export default SearchComponent;
