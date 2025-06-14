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

      <Select
        label={`Number Mode`}
        settingsKey="numberMode"
        options={[
          { name: "Hexadecimal" }, 
          { name: "Standard Decimal" }, 
          { name: "Full Hexadecimal" }
        ]}
      />
    </Section>
  </Page>
));
