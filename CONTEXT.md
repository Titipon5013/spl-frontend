# ParkPilot

ParkPilot is a smart parking operations context for CAMT. It names the people, parking signals, device states, and reporting concepts used by the administrator command center.

## Language

**Parking Administrator**:
An approved operator who can view parking analytics, manage access requests, operate dashboard tools, and export reports.
_Avoid_: Admin user, staff account

**Authorized Parking User**:
A vehicle owner whose parking access is represented by a license plate registration record.
_Avoid_: Customer, commuter account

**Parking Lot**:
A configured CAMT parking area monitored by cameras and exposed through analytics filters.
_Avoid_: Zone, garage

**Parking Spot**:
An individual monitored space within a parking lot.
_Avoid_: Slot, bay, cell

**Camera Event**:
A structured event from the camera or edge pipeline that describes parking lot or parking spot state.
_Avoid_: Detection message, camera log

**Device Health**:
The online, offline, or degraded state of the Orange Pi board and connected camera streams.
_Avoid_: System status, heartbeat status

**Heatmap**:
A visualization of parking spot occupancy intensity over a selected parking lot or period.
_Avoid_: Density chart, usage grid

**Weekly Report**:
A scheduled or manual report containing KPI, utilization, trend, and operational summary data for approved administrators.
_Avoid_: Export, summary file

**Approval Status**:
The access state used to gate administrator capabilities. ParkPilot uses pending, approved, rejected, and revoked.
_Avoid_: Role, permission level
