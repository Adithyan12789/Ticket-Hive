import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import './SearchBar.css';

const { Search } = Input;
import { SearchBarProps } from "../../Types/UserTypes";

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <Search
      placeholder="Search users"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onSearch={(value) => setSearchTerm(value)}
      enterButton={<SearchOutlined />}
      size="large"
      style={{ borderRadius: "25px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}
    />
  );
};

export default SearchBar;
