import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import './SearchBar.css';

const { Search } = Input;

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <Search
      placeholder="Search users"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
      onSearch={(value) => setSearchTerm(value)} // Handle search button click
      enterButton={<SearchOutlined />}
      size="large"
      style={{ borderRadius: "25px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}
    />
  );
};

export default SearchBar;
