import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import Logo from '../../assets/logo.png'; // Assuming logo.png is in src/assets

// Register a font to avoid "Font family not recognized" warnings
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/fontsource-helvetica-neue@4.0.0/files/helvetica-neue-latin-400-normal.woff', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/fontsource-helvetica-neue@4.0.0/files/helvetica-neue-latin-700-normal.woff', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center'
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 20
  },
  officeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  unitName: {
    fontSize: 14,
    color: '#555'
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '25%',
    backgroundColor: '#3F5BA9',
    color: 'white',
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold'
  },
  tableCol: {
    width: '25%',
    padding: 8,
    fontSize: 9,
    borderBottom: '1px solid #ddd'
  }
});

export const BusinessSummaryReport = ({ data }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <View style={styles.header}>
        <Image src={Logo} style={styles.logo} />
        <View>
          <Text style={styles.officeName}>Local Economic and Business Development Office</Text>
          <Text style={styles.unitName}>Investment and Promotions Unit</Text>
        </View>
      </View>

      <Text style={styles.reportTitle}>Business Summary Report</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={{ marginBottom: 15 }}>
          <Text>• Total Businesses: {data.totalBusinesses}</Text>
          <Text>• Active: {data.activeBusinesses}</Text>
          <Text>• Inactive: {data.inactiveBusinesses}</Text>
          <Text>• Pending: {data.pendingBusinesses}</Text>
          <Text>• Archived: {data.archivedBusinesses}</Text>
          {/* You can add byIndustry breakdown here if needed */}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business List</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text>Business Name</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Address</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Industry</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Status</Text>
            </View>
          </View>
          {data.businesses.map((business, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text>{business.bsns_name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{business.bsns_address}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{business.industry}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{business.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
