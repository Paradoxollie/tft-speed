module.exports = {
  packagerConfig: {
    asar: true,
    win32metadata: {
      CompanyName: 'TFT Speed',
      FileDescription: 'Overlay pour Teamfight Tactics avec recommandations en temps réel',
      OriginalFilename: 'TFT Speed.exe',
      ProductName: 'TFT Speed',
      InternalName: 'tft-speed',
      Authors: 'TFT Speed Team'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'tft-speed',
        authors: 'TFT Speed Team',
        description: 'Overlay pour Teamfight Tactics avec recommandations en temps réel'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ]
}; 