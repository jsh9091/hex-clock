registerSettingsPage(({ settings }) => (
  <Page>
    <Section
      title={
        <Text bold align="center">
          Language Clock Settings
        </Text>
      }
    >
      <ColorSelect
        settingsKey="color"
        colors={[
          { color: "aqua" },
          { color: "red" },
          { color: "gold" },
          { color: "orchid" },
          { color: "limegreen" },
          { color: "darkgoldenrod" },
        ]}
      />
    </Section>
  </Page>
));
