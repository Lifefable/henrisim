<template>
  <div class="about">
    <div class="about-container">
      <h1>About Henri Home Passive House Simulation</h1>

      <section class="intro">
        <p>
          This simulation models a modern Passive House (Henri Home) with advanced environmental
          systems that work together to maintain comfort while minimizing energy consumption.
        </p>
      </section>

      <section class="modules">
        <h2>Simulation Modules</h2>

        <div class="module-grid">
          <div class="module-info">
            <h3>🔥 Heat Pump System</h3>
            <p>
              The primary heating and cooling system. Uses electrical energy to move heat
              efficiently, with a Coefficient of Performance (COP) of 3.5, meaning it
              produces 3.5 units of heating/cooling for every unit of electricity consumed.
            </p>
          </div>

          <div class="module-info">
            <h3>💨 Energy Recovery Ventilation (ERV)</h3>
            <p>
              Provides fresh outdoor air while recovering 70% of the thermal energy from
              outgoing stale air. Also improves indoor air quality by filtering and
              exchanging air throughout the house.
            </p>
          </div>

          <div class="module-info">
            <h3>☀️ Solar Panel System</h3>
            <p>
              40m² of solar panels generate clean electricity during daylight hours.
              Also simulates passive solar heat gain through south-facing windows,
              which can reduce heating loads during sunny periods.
            </p>
          </div>

          <div class="module-info">
            <h3>🔋 Battery Storage</h3>
            <p>
              20kWh battery system stores excess solar energy for use when the sun
              isn't shining. Helps reduce grid dependence and provides backup power
              during outages.
            </p>
          </div>
        </div>
      </section>

      <section class="building">
        <h2>Building Characteristics</h2>
        <div class="building-specs">
          <div class="spec-item">
            <strong>Floor Area:</strong> 150 m²
          </div>
          <div class="spec-item">
            <strong>Wall Insulation:</strong> R-5.0 m²·K/W
          </div>
          <div class="spec-item">
            <strong>Roof Insulation:</strong> R-7.0 m²·K/W
          </div>
          <div class="spec-item">
            <strong>Windows:</strong> 20 m² with U-value of 0.8 W/m²·K
          </div>
          <div class="spec-item">
            <strong>Air Leakage:</strong> 0.3 ACH (very tight construction)
          </div>
        </div>
      </section>

      <section class="location">
        <h2>Multi-Climate Simulation</h2>
        <p>
          The simulation features <strong>enhanced climate modeling</strong> with support for multiple cities
          and seasonal variations. Choose from 9 global locations and 4 key seasonal dates to explore
          passive house performance across different climates:
        </p>

        <div class="climate-features">
          <div class="feature-group">
            <h3>🌍 Global Cities</h3>
            <ul>
              <li><strong>San Francisco, USA</strong> - Mediterranean climate (37.8°N)</li>
              <li><strong>Denver, USA</strong> - Continental semi-arid (39.7°N)</li>
              <li><strong>Los Angeles, USA</strong> - Mediterranean/desert (34.1°N)</li>
              <li><strong>Chicago, USA</strong> - Continental humid (41.9°N)</li>
              <li><strong>New York, USA</strong> - Humid subtropical (40.7°N)</li>
              <li><strong>Miami, USA</strong> - Tropical (25.8°N)</li>
              <li><strong>Dallas, USA</strong> - Humid subtropical (32.8°N)</li>
              <li><strong>London, UK</strong> - Oceanic (51.5°N)</li>
              <li><strong>Frankfurt, Germany</strong> - Continental oceanic (50.1°N)</li>
            </ul>
          </div>

          <div class="feature-group">
            <h3>📅 Seasonal Dates</h3>
            <ul>
              <li><strong>Winter Solstice</strong> (Dec 21) - Shortest day, minimal solar gain</li>
              <li><strong>Spring Equinox</strong> (Mar 20) - Equal day/night, moderate solar</li>
              <li><strong>Summer Solstice</strong> (Jun 21) - Longest day, maximum solar gain</li>
              <li><strong>Fall Equinox</strong> (Sep 22) - Equal day/night, moderate solar</li>
            </ul>
          </div>
        </div>

        <p>
          Each climate configuration includes realistic temperature ranges, humidity patterns,
          air quality baselines, and accurate solar radiation calculations based on latitude
          and seasonal solar angles.
        </p>

        <h3>🌤️ Enhanced Climate Modeling Features</h3>
        <ul>
          <li>Realistic diurnal temperature variations based on continental vs. maritime influence</li>
          <li>Accurate solar radiation calculations using solar elevation and atmospheric transmission</li>
          <li>Humidity patterns that respond to temperature and geographic location</li>
          <li>Air quality baselines reflecting regional pollution levels</li>
          <li>Day length calculations for each latitude and season</li>
          <li>Solar declination angles for precise seasonal solar modeling</li>
        </ul>
      </section>

      <section class="comfort">
        <h2>Comfort Scoring</h2>
        <p>
          The comfort score (0-100%) evaluates how well the house systems maintain
          occupant comfort based on:
        </p>
        <ul>
          <li><strong>Temperature:</strong> ±2°C from target is comfortable</li>
          <li><strong>Humidity:</strong> 30-60% relative humidity is ideal</li>
          <li><strong>Air Quality:</strong> >80% normalized air quality is good</li>
          <li><strong>Safety:</strong> Emergency events reduce comfort</li>
        </ul>
      </section>

      <section class="usage">
        <h2>How to Use</h2>
        <ol>
          <li>Use the <strong>time slider</strong> to simulate different hours of the day</li>
          <li><strong>Toggle modules</strong> on/off to see their individual effects</li>
          <li>Try the <strong>preset times</strong> (morning, noon, evening) for quick scenarios</li>
          <li>Trigger a <strong>smoke event</strong> to see safety system responses</li>
          <li>Watch how <strong>energy flows</strong> change throughout the day</li>
        </ol>
      </section>


    </div>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
}

.about-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #111827;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}

h2 {
  color: #1f2937;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 2.5rem 0 1.5rem 0;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

h3 {
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

section {
  margin-bottom: 2rem;
}

.intro p {
  font-size: 1.2rem;
  color: #374151;
  line-height: 1.7;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 500;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.module-info {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.module-info p {
  color: #374151;
  line-height: 1.6;
  font-weight: 500;
}

.building-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.spec-item {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid #e5e7eb;
  border-left: 4px solid #3b82f6;
  color: #111827;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.spec-item strong {
  color: #1f2937;
  font-weight: 700;
}

.tech-stack {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.tech-item {
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}

ul,
ol {
  color: #374151;
  line-height: 1.6;
  font-weight: 500;
}

li {
  margin-bottom: 0.5rem;
}

p {
  color: #374151;
  line-height: 1.6;
  font-weight: 500;
}

.climate-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 1.5rem 0;
}

.feature-group h3 {
  color: #1f2937;
  font-size: 1.125rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.feature-group ul {
  margin: 0;
}

.feature-group li {
  margin-bottom: 0.75rem;
  padding-left: 0.5rem;
}

@media (max-width: 768px) {
  .about {
    padding: 1rem;
  }

  .about-container {
    padding: 2rem;
  }

  h1 {
    font-size: 2rem;
  }

  .climate-features {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }

  .building-specs {
    grid-template-columns: 1fr;
  }
}
</style>
