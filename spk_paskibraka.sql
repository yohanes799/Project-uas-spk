-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 30, 2026 at 05:48 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spk_paskibraka`
--

-- --------------------------------------------------------

--
-- Table structure for table `ahp_matriks`
--

CREATE TABLE `ahp_matriks` (
  `id` int(11) NOT NULL,
  `kriteria_id_1` varchar(10) DEFAULT NULL,
  `kriteria_id_2` varchar(10) DEFAULT NULL,
  `nilai_perbandingan` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ahp_matriks`
--

INSERT INTO `ahp_matriks` (`id`, `kriteria_id_1`, `kriteria_id_2`, `nilai_perbandingan`) VALUES
(4, 'C1', 'C4', 7),
(5, 'C1', 'C2', 3),
(6, 'C1', 'C3', 5),
(7, 'C1', 'C5', 3),
(8, 'C2', 'C3', 3),
(9, 'C2', 'C4', 5),
(10, 'C3', 'C4', 3);

-- --------------------------------------------------------

--
-- Table structure for table `alternatif`
--

CREATE TABLE `alternatif` (
  `id` int(11) NOT NULL,
  `nama_peserta` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alternatif`
--

INSERT INTO `alternatif` (`id`, `nama_peserta`, `created_at`) VALUES
(1, 'Dandi', '2026-06-29 07:42:07'),
(2, 'Ardiman', '2026-06-29 07:42:07'),
(3, 'Wikara', '2026-06-29 07:42:07'),
(4, 'Elzaki', '2026-06-29 07:42:07'),
(5, 'Tami', '2026-06-29 07:42:07'),
(6, 'Ranto', '2026-06-29 07:42:07'),
(7, 'Wijaya', '2026-06-29 07:42:07'),
(8, 'Sari', '2026-06-29 07:42:07'),
(9, 'Sikali', '2026-06-29 07:42:07'),
(10, 'Yuni', '2026-06-29 07:42:07');

-- --------------------------------------------------------

--
-- Table structure for table `hasil_akhir`
--

CREATE TABLE `hasil_akhir` (
  `id` int(11) NOT NULL,
  `alternatif_id` int(11) NOT NULL,
  `nilai_total` float NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hasil_akhir`
--

INSERT INTO `hasil_akhir` (`id`, `alternatif_id`, `nilai_total`, `status`, `created_at`) VALUES
(1, 10, 0.953899, 'Lolos', '2026-06-30 15:45:32'),
(2, 3, 0.952181, 'Lolos', '2026-06-30 15:45:32'),
(3, 8, 0.936242, 'Lolos', '2026-06-30 15:45:32'),
(4, 1, 0.789358, 'Lolos', '2026-06-30 15:45:32'),
(5, 5, 0.720716, 'Lolos', '2026-06-30 15:45:32'),
(6, 7, 0.612207, 'Lolos', '2026-06-30 15:45:32'),
(7, 6, 0.589279, 'Lolos', '2026-06-30 15:45:32'),
(8, 9, 0.584621, 'Lolos', '2026-06-30 15:45:32'),
(9, 4, 0.557893, 'Lolos', '2026-06-30 15:45:32'),
(10, 2, 0.552741, 'Lolos', '2026-06-30 15:45:32');

-- --------------------------------------------------------

--
-- Table structure for table `kriteria`
--

CREATE TABLE `kriteria` (
  `id` int(11) NOT NULL,
  `kode` varchar(5) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `tipe` enum('Benefit','Cost') NOT NULL,
  `bobot_ahp` float DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kriteria`
--

INSERT INTO `kriteria` (`id`, `kode`, `nama`, `tipe`, `bobot_ahp`, `created_at`) VALUES
(1, 'C1', 'Tinggi Badan', 'Benefit', 0.557893, '2026-06-29 07:42:07'),
(2, 'C2', 'Riwayat Penyakit', 'Benefit', 0.263345, '2026-06-29 07:42:07'),
(3, 'C3', 'Mahir Baris Berbaris', 'Benefit', 0.121873, '2026-06-29 07:42:07'),
(31, 'C4', 'Berpenampilan Menarik', 'Benefit', 0.0568898, '2026-06-30 08:02:12');

-- --------------------------------------------------------

--
-- Table structure for table `penilaian`
--

CREATE TABLE `penilaian` (
  `id` int(11) NOT NULL,
  `alternatif_id` int(11) NOT NULL,
  `kriteria_id` varchar(10) DEFAULT NULL,
  `nilai` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penilaian`
--

INSERT INTO `penilaian` (`id`, `alternatif_id`, `kriteria_id`, `nilai`) VALUES
(1, 1, 'C1', 165),
(2, 1, 'C2', 50),
(3, 2, 'C1', 160),
(4, 2, 'C4', 60),
(5, 3, 'C1', 160),
(6, 3, 'C2', 50),
(7, 3, 'C3', 80),
(8, 3, 'C4', 80),
(9, 4, 'C1', 175),
(10, 5, 'C1', 170),
(11, 5, 'C3', 80),
(12, 5, 'C4', 80),
(13, 6, 'C1', 167),
(14, 6, 'C4', 80),
(15, 7, 'C1', 164),
(16, 7, 'C3', 40),
(17, 7, 'C4', 40),
(18, 8, 'C1', 155),
(19, 8, 'C2', 50),
(20, 8, 'C3', 80),
(21, 8, 'C4', 80),
(22, 9, 'C1', 170),
(23, 9, 'C4', 60),
(24, 10, 'C1', 165),
(25, 10, 'C2', 50),
(26, 10, 'C3', 80),
(27, 10, 'C4', 60);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','guru','panitia') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'admin123', 'admin', '2026-06-29 07:42:07'),
(2, 'guru', 'guru123', 'guru', '2026-06-29 07:42:07'),
(3, 'panitia', 'panitia123', 'panitia', '2026-06-29 07:42:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ahp_matriks`
--
ALTER TABLE `ahp_matriks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matriks_unik` (`kriteria_id_1`,`kriteria_id_2`),
  ADD KEY `kriteria_id_2` (`kriteria_id_2`);

--
-- Indexes for table `alternatif`
--
ALTER TABLE `alternatif`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hasil_akhir`
--
ALTER TABLE `hasil_akhir`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alternatif_id` (`alternatif_id`);

--
-- Indexes for table `kriteria`
--
ALTER TABLE `kriteria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`);

--
-- Indexes for table `penilaian`
--
ALTER TABLE `penilaian`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `penilaian_unik` (`alternatif_id`,`kriteria_id`),
  ADD KEY `kriteria_id` (`kriteria_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ahp_matriks`
--
ALTER TABLE `ahp_matriks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `alternatif`
--
ALTER TABLE `alternatif`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `hasil_akhir`
--
ALTER TABLE `hasil_akhir`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `kriteria`
--
ALTER TABLE `kriteria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `penilaian`
--
ALTER TABLE `penilaian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hasil_akhir`
--
ALTER TABLE `hasil_akhir`
  ADD CONSTRAINT `hasil_akhir_ibfk_1` FOREIGN KEY (`alternatif_id`) REFERENCES `alternatif` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `penilaian`
--
ALTER TABLE `penilaian`
  ADD CONSTRAINT `penilaian_ibfk_1` FOREIGN KEY (`alternatif_id`) REFERENCES `alternatif` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
