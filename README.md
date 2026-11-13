# The DIVER Simulation Model (1978–1979)

**A reconstructed, open-source preservation of a pioneering 1978/79 digital design sketchbook for real-time diving safety information systems.**

Originally designed by **Dagfinn Aksnes** (Royal College of Art MDev student) and programmed in Disk BASIC by **Dr. George Mallen** (Visitor/Fellow at the RCA and co-founder of the Computer Arts Society) on **Compucolor/Intecolor 8001-family** hardware. Reconstructed, transcribed to React/JSX and QB64, and documented by **John Dunlop (2026)**.

---

## 🌟 Historical Significance & Innovation

This software represents an early intersection of human-computer interaction (HCI), industrial design, and real-time safety systems. Created in the winter of 1978/1979 at the RCA Department of Design Research, it served as a functional digital "sketchbook" to prove the viability of giving divers real-time access to life-critical safety metrics several years before commercial dive computers existed.

### Key Technical Breakthroughs for 1978:
* **Asynchronous Task Queuing:** The software actively prompts for and queues the next dive activity before the current task finishes processing, creating a smooth operational feedback loop.
* **Advanced Graphical Representations:** Relies heavily on the complex **Intecolor 8001 PLOT command** to draw vector profiles and color-coded decompression obligation bands directly in the terminal's hardware buffer.
* **Decision-Oriented Display:** Uses color transitions and flashing countdown alerts (such as `T15>20`) to warn the diver of an impending increase in decompression stop time before crossing a table boundary.

---

## 📁 Repository Structure

This archive preserves the software and its forensic recovery trail across distinct functional layers:

* **`/original-basic/`**: The raw, verified 1978/79 BASIC source code (`DIVER.BAS`) recovered from surviving paper printouts.
* **`/jsx-web-app/`**: A modern React/JSX browser-based reconstruction executing the exact raster vector mechanics of the original Intel 8080 graphics engine.
* **`/qb64-port/`**: A standalone desktop-compatible BASIC port (`DIVER_QB64.BAS`) compiled via QB64PE.
* **`/CCEMU/`**: Isolation test scripts and captures executed on Jim Battle's Compucolor II Emulator.
* **`/docs/`**: Complete documentation, including the **User Manual**, **Functional & Design Specification**, **Reconstruction Narrative**, and forensic testing logs.
* **`/images/`**: Primary visual provenance, including 1979 CRT screen photographs of Dr. George Mallen running the simulation and scans of the original paper listing.

---

## ⚠️ Operational Warning

This simulation is preserved strictly for **educational, historical, and digital humanities demonstration purposes**. The decompression model is derived from a late-1970s Royal Navy air-diving table as implemented in a student prototype and is **NOT validated for operational dive planning**. Always use certified, approved dive computers for real-world diving.

---

## ⚖️ Provenance, Rights & Licensing

* **Authorship:** Jointly authored by Dagfinn Aksnes (Design Concept) and Dr. George Mallen (BASIC Implementation) at the Royal College of Art, 1978/79.
* **Permissions:** Reconstructed from surviving paper listings and published with the explicit permission of Dr. George Mallen's family, in communication with the Royal College of Art Archives.
* **License:** Released under the **MIT License**.
* **Citing this work:** Use the **"Cite this repository"** button in the right-hand sidebar, or cite the permanent Zenodo archive DOI: `[Insert Zenodo DOI here once minted]`.
