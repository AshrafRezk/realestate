import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Train, 
  Plane, 
  Landmark, 
  Building, 
  Anchor, 
  GraduationCap, 
  School, 
  Library, 
  Hospital, 
  ShoppingBag,
  MapPin
} from 'lucide-react';
import { getNearbyAmenities, NearbyAmenity, AmenityCategory } from '../../lib/utils/overpass';

interface NearbyAmenitiesProps {
  lat?: number;
  lng?: number;
}

const getCategoryIcon = (category: AmenityCategory) => {
  const props = { size: 28, strokeWidth: 1.5 };
  switch (category) {
    case 'Train Station': return <Train {...props} />;
    case 'Airport': return <Plane {...props} />;
    case 'Bank': return <Landmark {...props} />;
    case 'Chamber of Commerce': return <Building {...props} />;
    case 'Port': return <Anchor {...props} />;
    case 'University': return <GraduationCap {...props} />;
    case 'School': return <School {...props} />;
    case 'Library': return <Library {...props} />;
    case 'Hospital': return <Hospital {...props} />;
    case 'Mall': return <ShoppingBag {...props} />;
    default: return <MapPin {...props} />;
  }
};

export default function NearbyAmenities({ lat, lng }: NearbyAmenitiesProps) {
  const { t, i18n } = useTranslation();
  const [amenities, setAmenities] = useState<NearbyAmenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function load() {
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      try {
        const results = await getNearbyAmenities(lat, lng);
        setAmenities(results);
      } catch (error) {
        console.error('Error fetching amenities:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [lat, lng]);

  const isRtl = i18n.language === 'ar';

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If no lat/lng, or API failed, or no results found within 30 mins, hide section
  if (!lat || !lng || hasError || amenities.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
        {t('project.nearbyLocations', 'Nearby Locations')}
      </Typography>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 4, 
          bgcolor: 'white',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          {amenities.map((amenity, index) => (
            <Grid item xs={6} sm={4} md={3} lg={2.4} key={`${amenity.id}-${index}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center',
                    gap: 1
                  }}
                >
                  <Box sx={{ color: 'text.secondary', mb: 1 }}>
                    {getCategoryIcon(amenity.category)}
                  </Box>
                  
                  <Typography variant="h4" fontWeight="300" sx={{ color: 'text.primary', lineHeight: 1 }}>
                    {amenity.estimatedMinutes}
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      textTransform: 'uppercase', 
                      letterSpacing: 1, 
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      lineHeight: 1.4,
                      mt: 1
                    }}
                  >
                    {isRtl ? 'دقيقة من' : 'MINUTES FROM'}<br/>
                    <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {isRtl ? (amenity.nameAr || amenity.name) : amenity.name}
                    </Box>
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
