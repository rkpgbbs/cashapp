import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Autosuggest from '@cloudscape-design/components/autosuggest';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';

// Search dropdown options
const searchOptions = [
    { label: 'All', value: 'all' },
    { label: 'Invoice', value: 'invoice' },
    { label: 'Receipt', value: 'receipt' },
    { label: 'Customer', value: 'customer' },
    { label: 'Order', value: 'order' },
    { label: 'Credit Memo', value: 'credit_memo' },
];

// Fallback sample data
const sampleInvoiceData = [
    {
        "Invoice_Number": "FR24131AEI",
        "Statement Number": "STM-1293-H03",
        "Statement Type": "Invoice",
        "Invoice Date": "15-Apr-24",
        "Name": "Vixor Jabbix SARL",
        "Original Amount": 591.36,
        "Cur": "EUR",
        "Status": "Open",
        "Country": "FR",
        "Order Number": "ORD-061"
    },
    {
        "Invoice_Number": "DE24464BEI",
        "Statement Number": "STM-1294-I03",
        "Statement Type": "Invoice",
        "Invoice Date": "20-May-24",
        "Name": "Klixx Womblex GmbH",
        "Original Amount": 546,
        "Cur": "EUR",
        "Status": "Open",
        "Country": "DE",
        "Order Number": "ORD-062"
    },
    {
        "Invoice_Number": "CA24797HYT",
        "Statement Number": "STM-1295-J03",
        "Statement Type": "Credit Memo",
        "Invoice Date": "24-Jun-24",
        "Name": "Jixxle Yazzex Corp",
        "Original Amount": -248.4,
        "Cur": "CAD",
        "Status": "Open",
        "Country": "CA",
        "Order Number": "ORD-063"
    }
];

const SearchComponent = ({ searchDropdown, setSearchDropdown }) => {
    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [invoiceData, setInvoiceData] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const navigate = useNavigate();

    // Load invoice data from JSON file
    useEffect(() => {
        console.log("SearchComponent: Starting to load invoice data");

        // Always set fallback data first to ensure we have something
        setInvoiceData(sampleInvoiceData);

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

                console.log("SearchComponent: Will try these paths:", paths);
                let data = null;

                for (const path of paths) {
                    try {
                        console.log(`SearchComponent: Attempting to fetch from ${path}`);
                        const response = await fetch(path);
                        console.log(`SearchComponent: Fetch response status: ${response.status}`);

                        if (response.ok) {
                            data = await response.json();
                            console.log(`SearchComponent: Successfully loaded invoice data from ${path}, found ${data.length} records`);
                            break;
                        }
                    } catch (e) {
                        console.log(`SearchComponent: Failed to load from ${path}: ${e.message}`);
                    }
                }

                if (data && data.length > 0) {
                    console.log("SearchComponent: Setting real data from JSON");
                    setInvoiceData(data);
                    setDataLoaded(true);
                } else {
                    console.warn('SearchComponent: Using fallback sample data - could not load JSON');
                }
            } catch (error) {
                console.error('SearchComponent: Error loading invoice data:', error);
            }
        };

        loadInvoiceData();
    }, []);

    // Filter suggestions based on search input and selected category
    const filterSuggestions = (value) => {
        console.log(`SearchComponent: Filtering suggestions for "${value}" in category "${searchDropdown.value}"`);
        console.log(`SearchComponent: Have ${invoiceData.length} invoices to search through`);

        if (!value || value.length < 2 || !invoiceData.length) return [];

        const searchType = searchDropdown.value;
        const lowercasedValue = value.toLowerCase();

        const filteredResults = invoiceData
            .filter(item => {
                if (searchType === 'all') {
                    return (
                        (item.Invoice_Number?.toLowerCase().includes(lowercasedValue)) ||
                        (item.Name?.toLowerCase().includes(lowercasedValue)) ||
                        (item["Statement Number"]?.toLowerCase().includes(lowercasedValue)) ||
                        (item["Order Number"]?.toLowerCase().includes(lowercasedValue))
                    );
                } else if (searchType === 'invoice') {
                    return item.Invoice_Number?.toLowerCase().includes(lowercasedValue);
                } else if (searchType === 'customer') {
                    return item.Name?.toLowerCase().includes(lowercasedValue);
                } else if (searchType === 'order') {
                    return item["Order Number"]?.toLowerCase().includes(lowercasedValue);
                } else if (searchType === 'credit_memo') {
                    return item["Statement Type"]?.toLowerCase() === 'credit memo' &&
                        (item.Invoice_Number?.toLowerCase().includes(lowercasedValue) ||
                            item["Statement Number"]?.toLowerCase().includes(lowercasedValue));
                }
                return false;
            })
            .slice(0, 10); // Limit to 10 suggestions

        console.log(`SearchComponent: Found ${filteredResults.length} matching results`);

        return filteredResults.map(item => ({
            value: item.Invoice_Number,
            label: `${item.Invoice_Number} - ${item.Name} - ${item["Statement Type"]} - ${item["Original Amount"]} ${item.Cur}`,
            description: `${item["Invoice Date"]} | ${item.Status} | ${item.Country}`
        }));
    };

    const handleSearchChange = (event) => {
        const value = event.detail.value;
        console.log(`SearchComponent: Search value changed to "${value}"`);
        setSearchValue(value);

        const newSuggestions = filterSuggestions(value);
        console.log(`SearchComponent: Setting ${newSuggestions.length} suggestions`);
        setSuggestions(newSuggestions);
    };

    const handleSearchSelect = (event) => {
        const selectedInvoiceNumber = event.detail.value;
        console.log(`SearchComponent: Selected invoice ${selectedInvoiceNumber}`);
        navigate(`/invoice?invoice_number=${selectedInvoiceNumber}`);
        setSearchValue('');
        setSuggestions([]);
    };

    const handleSearchTypeChange = (event) => {
        console.log(`SearchComponent: Search type changed to ${event.detail.selectedOption.value}`);
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
                        placeholder={dataLoaded ? "Search..." : "Search (using sample data)"}
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