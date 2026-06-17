import { Location } from '../models/Location.js';

export const getGeofence = async (req, res) => {
  try {
    const site = await Location.findOne({ order: [['id', 'ASC']] });
    res.status(200).json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGeofence = async (req, res) => {
  try {
    const { officeName, latitude, longitude, radiusMeters } = req.body;
    let site = await Location.findOne({ order: [['id', 'ASC']] });
    if (site) {
      await site.update({ officeName, latitude, longitude, radiusMeters });
    } else {
      site = await Location.create({ officeName, latitude, longitude, radiusMeters });
    }
    res.status(200).json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};