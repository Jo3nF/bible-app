import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PsalmReaderScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [psalm, setPsalm] = useState(null);
  const [currentPsalm, setCurrentPsalm] = useState(23); // Default to Psalm 23

  useEffect(() => {
    // Simulate loading the psalm
    setTimeout(() => {
      setPsalm({
        number: 23,
        title: "Salmo 23",
        content: [
          "Jehová es mi pastor; nada me faltará.",
          "En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará.",
          "Confortará mi alma; me guiará por sendas de justicia por amor de su nombre.",
          "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento.",
          "Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando.",
          "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa de Jehová moraré por largos días."
        ]
      });
      setLoading(false);
    }, 1000);
  }, [currentPsalm]);

  const goToPrevPsalm = () => {
    if (currentPsalm > 1) {
      setCurrentPsalm(currentPsalm - 1);
      setLoading(true);
    }
  };

  const goToNextPsalm = () => {
    if (currentPsalm < 150) {
      setCurrentPsalm(currentPsalm + 1);
      setLoading(true);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>Cargando Salmo...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{psalm.title}</Text>
          </View>
          <ScrollView style={styles.scrollView}>
            <View style={styles.content}>
              {psalm.content.map((verse, index) => (
                <View key={index} style={styles.verseContainer}>
                  <Text style={styles.verseNumber}>{index + 1}</Text>
                  <Text style={styles.verseText}>{verse}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.navigationBar}>
            <TouchableOpacity 
              style={[styles.navButton, currentPsalm === 1 && styles.disabledButton]} 
              onPress={goToPrevPsalm}
              disabled={currentPsalm === 1}
            >
              <Text style={styles.navButtonText}>Anterior</Text>
            </TouchableOpacity>
            <Text style={styles.psalmNumber}>Salmo {currentPsalm}</Text>
            <TouchableOpacity 
              style={[styles.navButton, currentPsalm === 150 && styles.disabledButton]} 
              onPress={goToNextPsalm}
              disabled={currentPsalm === 150}
            >
              <Text style={styles.navButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#d4af37',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4d2600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  verseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#d4af37',
    width: 25,
  },
  verseText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: '#4d2600',
    fontWeight: 'bold',
  },
  psalmNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PsalmReaderScreen; 