import { colors } from '@/utils/colors';
import React from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface EventLocationCardProps {
    locationName: string;
    locationDetails: string;
    eventType: string;
    imageUrl: ImageSourcePropType;
    rating: number;
}

export default function EventLocationCard({
    locationName,
    locationDetails,
    eventType,
    imageUrl,
    rating,
}: EventLocationCardProps) {
    return (
        <View style={eventLocationStyles.cardContainer}>
            <Image source={imageUrl} style={eventLocationStyles.cardImage} />
            <View style={eventLocationStyles.cardContent}>
                <Text style={eventLocationStyles.locationName}>{locationName}</Text>
                <Text style={eventLocationStyles.locationDetails}>{locationDetails}</Text>
                <Text style={eventLocationStyles.eventType}>{eventType}</Text>
            </View>
        </View>
    );
}

const eventLocationStyles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#1C1C29',
        borderRadius: width * 0.05,
        overflow: 'hidden',
        marginTop: height * 0.04,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    cardImage: {
        width: '100%',
        height: height * 0.2, // 20% da altura da tela
        resizeMode: 'cover',
    },
    cardContent: {
        padding: width * 0.05,
    },
    locationName: {
        color: '#fff',
        fontSize: width * 0.055,
        fontFamily: 'AkiraExpanded-Superbold',
        marginBottom: height * 0.005,
    },
    locationDetails: {
        color: '#ccc',
        fontSize: width * 0.038,
        fontFamily: 'Montserrat-Regular',
        marginBottom: height * 0.01,
    },
    eventType: {
        color: colors.purple,
        fontSize: width * 0.038,
        fontFamily: 'Montserrat-SemiBold',
    },
});