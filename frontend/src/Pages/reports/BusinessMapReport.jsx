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
  mapContainer: {
    height: 400,
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #ddd',
    padding: 10,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#888',
  },
  locationList: {
    marginTop: 20
  },
  locationItem: {
    marginBottom: 5,
    fontSize: 10
  }
});

export const BusinessMapReport = ({ data }) => {
  // For this example, we'll still use placeholder text for the map image.
  // Integrating a live Leaflet map into a static PDF is complex and usually involves
  // rendering the map to an image on the server-side or client-side (e.g., using html2canvas)
  // and then passing that image data to the PDF.
  const hasLocationData = data.businesses.some(b => b.latitude && b.longitude);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={Logo} style={styles.logo} />
          <View>
            <Text style={styles.officeName}>Local Economic and Business Development Office</Text>
            <Text style={styles.unitName}>Investment and Promotions Unit</Text>
          </View>
        </View>

        <Text style={styles.reportTitle}>Business Location Report</Text>

        <View style={styles.mapContainer}>
          {hasLocationData ? (
            <Text style={styles.mapPlaceholderText}>
              Map visualization would appear here (requires server-side rendering or image capture)
            </Text>
            // In a real implementation, you would use:
            // <Image style={styles.mapImage} src={mapImageURL} />
          ) : (
            <Text style={styles.mapPlaceholderText}>No location data available for map visualization</Text>
          )}
        </View>

        <View style={styles.locationList}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Business Locations:</Text>
          {data.businesses.map((business, index) => (
            <Text key={index} style={styles.locationItem}>
              • {business.bsns_name}: {business.bsns_address} (Lat: {business.latitude}, Lng: {business.longitude})
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};
