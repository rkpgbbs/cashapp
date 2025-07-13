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

const SearchComponent = ({ searchDropdown, setSearchDropdown }) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const navigate = useNavigate();

  // Load invoice data from JSON file
  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        const response = await fetch('/Json/Invoice.json');
        if (!response.ok) {
          throw new Error('Failed to fetch invoice data');
        }
        const data = await response.json();
        setInvoiceData(data);
      } catch (error) {
        console.error('Error loading invoice data:', error);
      }
    };

    loadInvoiceData();
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
            item["Statement Number"]?.toLowerCase().includes(lowercasedValue) ||
            item["Order Number"]?.toLowerCase().includes(lowercasedValue)
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
      .slice(0, 10) // Limit to 10 suggestions
      .map(item => ({
        value: item.Invoice_Number,
        label: `${item.Invoice_Number} - ${item.Name} - ${item["Statement Type"]} - ${item["Original Amount"]} ${item.Cur}`,
        description: `${item["Invoice Date"]} | ${item.Status} | ${item.Country}`
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