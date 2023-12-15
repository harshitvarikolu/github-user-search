import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Space } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { green } from '@mui/material/colors';

const StyledHeading = styled.div`
  font-family: 'Roboto', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #228B22;
  margin-bottom: 20px;
  text-align: center;
`;

const StyledInput = styled(Input)`
  width: 90%;
  margin: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const ItemAnimation = ({ children }) => (
  <motion.div
    whileHover={{ scale: 1.1, opacity: 1 }}
    whileTap={{ scale: 0.9, opacity: 0.9 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const source = axios.CancelToken.source(); // Create a cancel token source

    const fetchUsers = async () => {
      if (searchTerm.trim() !== '') {
        setLoading(true);
        try {
          // Introduce a delay of 300 milliseconds
          await new Promise(resolve => setTimeout(resolve, 300));

          const response = await axios.get(`https://api.github.com/search/users?q=${searchTerm}`, {
            cancelToken: source.token, // Use the cancel token
          });
          const { data } = response;
          const filteredUsers = data.items.filter((user) => user.login.includes(searchTerm));
          setUsers(filteredUsers);
        } catch (error) {
          if (axios.isCancel(error)) {
            // Request was canceled, ignore
          } else {
            console.error(error);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setUsers([]);
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      // Cleanup function to cancel the ongoing request when component is unmounted
      source.cancel('Request canceled by cleanup');
    };
  }, [searchTerm]);

  const columns = [
    {
      title: 'Username',
      dataIndex: 'login',
      key: 'login',
    },
  ];

  return (
    <AnimatePresence>
      <div style={{ margin: '0 auto', width: '1200px' }}>
        <StyledHeading style={{margin: '20px', font: green[500]}}>GitHub User Search</StyledHeading>
        <StyledInput
          placeholder="Enter user name"
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Table
          columns={columns}
          dataSource={users.sort((a, b) => b.followers - a.followers)}
          rowKey="id"
          loading={loading}
          components={{
            Row: ItemAnimation,
          }}
        />
      </div>
    </AnimatePresence>
  );
};

export default SearchUsers;