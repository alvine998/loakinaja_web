import React, { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';

type Region = { id: string; name: string };

const selectClassName = 'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-loak-blue focus:ring-loak-blue';

async function loadRegions(path: string): Promise<Region[]> {
  const response = await fetch(apiUrl(`/regions?${path}`));
  if (!response.ok) throw new Error('Data wilayah gagal dimuat. Coba lagi.');
  const payload = await response.json();
  return payload.data as Region[];
}

export default function LocationSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (location: string) => void;
}) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    loadRegions('type=province')
      .then((data) => { if (active) setProvinces(data); })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoadingProvinces(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!value || !provinces.length || provinceId) return;
    const [districtName, cityName, provinceName] = value.split(',').map((part) => part.trim().toLocaleUpperCase('id-ID'));
    const province = provinces.find((region) => region.name.toLocaleUpperCase('id-ID') === provinceName);
    if (!province || !cityName || !districtName) return;
    let active = true;
    const restoreSelection = async () => {
      try {
        const nextCities = await loadRegions(`type=regency&parentId=${encodeURIComponent(province.id)}`);
        const city = nextCities.find((region) => region.name.toLocaleUpperCase('id-ID') === cityName);
        if (!city || !active) return;
        const nextDistricts = await loadRegions(`type=district&parentId=${encodeURIComponent(city.id)}`);
        const district = nextDistricts.find((region) => region.name.toLocaleUpperCase('id-ID') === districtName);
        if (!district || !active) return;
        setCities(nextCities);
        setDistricts(nextDistricts);
        setProvinceId(province.id);
        setCityId(city.id);
        setDistrictId(district.id);
      } catch {
        // The user can still choose their location manually if saved data cannot be restored.
      }
    };
    void restoreSelection();
    return () => { active = false; };
  }, [value, provinces, provinceId]);

  useEffect(() => {
    if (!provinceId) {
      setCities([]);
      return;
    }
    let active = true;
    setLoadingCities(true);
    setError('');
    loadRegions(`type=regency&parentId=${encodeURIComponent(provinceId)}`)
      .then((data) => { if (active) setCities(data); })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoadingCities(false); });
    return () => { active = false; };
  }, [provinceId]);

  useEffect(() => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    let active = true;
    setLoadingDistricts(true);
    setError('');
    loadRegions(`type=district&parentId=${encodeURIComponent(cityId)}`)
      .then((data) => { if (active) setDistricts(data); })
      .catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoadingDistricts(false); });
    return () => { active = false; };
  }, [cityId]);

  const updateLocation = (nextProvinceId: string, nextCityId: string, nextDistrictId: string) => {
    const province = provinces.find((region) => region.id === nextProvinceId);
    const city = cities.find((region) => region.id === nextCityId);
    const district = districts.find((region) => region.id === nextDistrictId);
    onChange(province && city && district ? `${district.name}, ${city.name}, ${province.name}` : '');
  };

  const changeProvince = (nextId: string) => {
    setProvinceId(nextId);
    setCityId('');
    setDistrictId('');
    onChange('');
  };

  const changeCity = (nextId: string) => {
    setCityId(nextId);
    setDistrictId('');
    onChange('');
  };

  const changeDistrict = (nextId: string) => {
    setDistrictId(nextId);
    updateLocation(provinceId, cityId, nextId);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="location-province">Provinsi</label>
        <select id="location-province" value={provinceId} onChange={(event) => changeProvince(event.target.value)} disabled={loadingProvinces} className={selectClassName}>
          <option value="">{loadingProvinces ? 'Memuat provinsi...' : 'Pilih provinsi'}</option>
          {provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="location-city">Kota / Kabupaten</label>
        <select id="location-city" value={cityId} onChange={(event) => changeCity(event.target.value)} disabled={!provinceId || loadingCities} className={selectClassName}>
          <option value="">{loadingCities ? 'Memuat kota/kabupaten...' : 'Pilih kota/kabupaten'}</option>
          {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="location-district">Kecamatan</label>
        <select id="location-district" value={districtId} onChange={(event) => changeDistrict(event.target.value)} disabled={!cityId || loadingDistricts} className={selectClassName}>
          <option value="">{loadingDistricts ? 'Memuat kecamatan...' : 'Pilih kecamatan'}</option>
          {districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
        </select>
      </div>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      {value && <p className="text-xs text-gray-500">Lokasi terpilih: <span className="font-medium text-gray-700">{value}</span></p>}
    </div>
  );
}
