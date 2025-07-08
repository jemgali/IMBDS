// // utils/mapToImage.js
// import html2canvas from 'html2canvas';

// export const captureMapImage = async (mapContainer) => {
//   try {
//     const canvas = await html2canvas(mapContainer, {
//       useCORS: true,
//       allowTaint: true,
//       scale: 2, // Higher quality
//       logging: false,
//       ignoreElements: (element) => {
//         // Ignore any interactive elements like zoom controls
//         return element.classList.contains('leaflet-control-container') || 
//                element.classList.contains('leaflet-control-zoom');
//       }
//     });
//     return canvas.toDataURL('image/png');
//   } catch (error) {
//     console.error('Error capturing map:', error);
//     return null;
//   }
// };
