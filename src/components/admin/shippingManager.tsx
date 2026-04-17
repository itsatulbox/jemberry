"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Zone = { id: string; name: string; rate: number; label: string };
type Country = {
  id: string;
  name: string;
  zone_id: string;
  is_popular: boolean;
  display_order: number;
};

export default function ShippingManager({
  initialZones,
  initialCountries,
}: {
  initialZones: Zone[];
  initialCountries: Country[];
}) {
  const [zones, setZones] = useState(initialZones);
  const [countries, setCountries] = useState(initialCountries);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [newCountry, setNewCountry] = useState({ name: "", zone_id: "" });
  const [newZone, setNewZone] = useState({ name: "", rate: "", label: "" });
  const router = useRouter();
  const supabase = createClient();

  const handleZoneUpdate = async (zone: Zone) => {
    const { error } = await supabase
      .from("shipping_zones")
      .update({ rate: zone.rate, label: zone.label })
      .eq("id", zone.id);
    if (error) {
      alert(error.message);
    } else {
      setEditingZone(null);
      router.refresh();
    }
  };

  const handleAddZone = async () => {
    const name = newZone.name.trim();
    const label = newZone.label.trim();
    const rate = parseFloat(newZone.rate);
    if (!name || !label || Number.isNaN(rate) || rate < 0) return;
    if (zones.some((z) => z.name === name)) {
      alert(`A zone named "${name}" already exists.`);
      return;
    }

    const { data, error } = await supabase
      .from("shipping_zones")
      .insert([{ name, rate, label }])
      .select()
      .single();

    if (error) {
      alert(error.message);
    } else if (data) {
      setZones([...zones, data]);
      setNewZone({ name: "", rate: "", label: "" });
      router.refresh();
    }
  };

  const handleDeleteZone = async (zone: Zone) => {
    if (zone.name === "rest_of_world") {
      alert(
        "Can't delete the rest_of_world zone — it's the fallback for unmatched countries.",
      );
      return;
    }
    const assigned = countries.filter((c) => c.zone_id === zone.id).length;
    if (assigned > 0) {
      alert(
        `Can't delete "${zone.name}" — ${assigned} ${assigned === 1 ? "country is" : "countries are"} still assigned to it. Reassign them first.`,
      );
      return;
    }
    if (!confirm(`Delete zone "${zone.name}"?`)) return;

    const { error } = await supabase
      .from("shipping_zones")
      .delete()
      .eq("id", zone.id);
    if (error) {
      alert(error.message);
    } else {
      setZones(zones.filter((z) => z.id !== zone.id));
      router.refresh();
    }
  };

  const handleAddCountry = async () => {
    const name = newCountry.name.trim();
    if (!name || !newCountry.zone_id) return;

    const maxOrder = countries.reduce(
      (max, c) => Math.max(max, c.display_order),
      0,
    );

    const { data, error } = await supabase
      .from("shipping_countries")
      .insert([
        {
          name,
          zone_id: newCountry.zone_id,
          is_popular: false,
          display_order: maxOrder + 1,
        },
      ])
      .select()
      .single();

    if (error) {
      alert(error.message);
    } else if (data) {
      setCountries([...countries, data]);
      setNewCountry({ name: "", zone_id: "" });
      router.refresh();
    }
  };

  const handleDeleteCountry = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabase
      .from("shipping_countries")
      .delete()
      .eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      setCountries(countries.filter((c) => c.id !== id));
      router.refresh();
    }
  };

  const handleCountryZoneChange = async (id: string, zone_id: string) => {
    const { error } = await supabase
      .from("shipping_countries")
      .update({ zone_id })
      .eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      setCountries(
        countries.map((c) => (c.id === id ? { ...c, zone_id } : c)),
      );
      router.refresh();
    }
  };

  const handleTogglePopular = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("shipping_countries")
      .update({ is_popular: !current })
      .eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      setCountries(
        countries.map((c) =>
          c.id === id ? { ...c, is_popular: !current } : c,
        ),
      );
      router.refresh();
    }
  };

  return (
    <div className="space-y-10 text-primary">
      {/* Zones / Rates */}
      <section>
        <h2 className="text-lg font-bold mb-4">Shipping Zones & Rates</h2>
        <div className="border border-primary/10 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary/5">
                <th className="text-left p-3 font-bold">Zone</th>
                <th className="text-left p-3 font-bold">Rate (NZD)</th>
                <th className="text-left p-3 font-bold">Label</th>
                <th className="text-right p-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr
                  key={zone.id}
                  className="border-b border-primary/5 hover:bg-primary/[0.02]"
                >
                  <td className="p-3 font-bold">{zone.name}</td>
                  <td className="p-3">
                    {editingZone === zone.id ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-24 border border-primary/20 p-1 rounded outline-none"
                        value={zone.rate}
                        onChange={(e) =>
                          setZones(
                            zones.map((z) =>
                              z.id === zone.id
                                ? { ...z, rate: parseFloat(e.target.value) || 0 }
                                : z,
                            ),
                          )
                        }
                      />
                    ) : (
                      `$${Number(zone.rate).toFixed(2)}`
                    )}
                  </td>
                  <td className="p-3">
                    {editingZone === zone.id ? (
                      <input
                        type="text"
                        className="w-full border border-primary/20 p-1 rounded outline-none"
                        value={zone.label}
                        onChange={(e) =>
                          setZones(
                            zones.map((z) =>
                              z.id === zone.id
                                ? { ...z, label: e.target.value }
                                : z,
                            ),
                          )
                        }
                      />
                    ) : (
                      <span className="opacity-60">{zone.label}</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {editingZone === zone.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleZoneUpdate(zone)}
                          className="px-3 py-1 bg-primary text-white rounded text-xs font-bold"
                        >
                          save
                        </button>
                        <button
                          onClick={() => {
                            const original = initialZones.find(
                              (z) => z.id === zone.id,
                            );
                            if (original) {
                              setZones(
                                zones.map((z) =>
                                  z.id === zone.id ? original : z,
                                ),
                              );
                            }
                            setEditingZone(null);
                          }}
                          className="px-3 py-1 text-xs font-bold opacity-60 hover:opacity-100"
                        >
                          cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingZone(zone.id)}
                          className="px-3 py-1 border border-primary/20 rounded text-xs font-bold hover:bg-primary/5"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone)}
                          className="px-3 py-1 text-red-400 hover:text-red-600 text-xs font-bold"
                        >
                          delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <input
            type="text"
            placeholder="Zone name (e.g. asia)"
            className="flex-1 min-w-[160px] border border-primary/20 p-2 rounded-md outline-none text-sm"
            value={newZone.name}
            onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Rate"
            className="w-24 border border-primary/20 p-2 rounded-md outline-none text-sm"
            value={newZone.rate}
            onChange={(e) => setNewZone({ ...newZone, rate: e.target.value })}
          />
          <input
            type="text"
            placeholder="Label (e.g. International Tracked (3-7 days))"
            className="flex-1 min-w-[200px] border border-primary/20 p-2 rounded-md outline-none text-sm"
            value={newZone.label}
            onChange={(e) => setNewZone({ ...newZone, label: e.target.value })}
          />
          <button
            onClick={handleAddZone}
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-md hover:brightness-95"
          >
            + add zone
          </button>
        </div>
      </section>

      {/* Countries */}
      <section>
        <h2 className="text-lg font-bold mb-4">Countries</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Country name"
            className="flex-1 border border-primary/20 p-2 rounded-md outline-none text-sm"
            value={newCountry.name}
            onChange={(e) =>
              setNewCountry({ ...newCountry, name: e.target.value })
            }
          />
          <select
            className="border border-primary/20 p-2 rounded-md outline-none text-sm"
            value={newCountry.zone_id}
            onChange={(e) =>
              setNewCountry({ ...newCountry, zone_id: e.target.value })
            }
          >
            <option value="">Select zone</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddCountry}
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-md hover:brightness-95"
          >
            + add
          </button>
        </div>

        <div className="border border-primary/10 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary/5">
                <th className="text-left p-3 font-bold">Country</th>
                <th className="text-left p-3 font-bold">Zone</th>
                <th className="text-center p-3 font-bold">Popular</th>
                <th className="text-right p-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr
                  key={country.id}
                  className="border-b border-primary/5 hover:bg-primary/[0.02]"
                >
                  <td className="p-3 font-bold">{country.name}</td>
                  <td className="p-3">
                    <select
                      className="border border-primary/20 p-1 rounded outline-none text-xs"
                      value={country.zone_id}
                      onChange={(e) =>
                        handleCountryZoneChange(country.id, e.target.value)
                      }
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} (${Number(z.rate).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        handleTogglePopular(country.id, country.is_popular)
                      }
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        country.is_popular
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {country.is_popular ? "popular" : "normal"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() =>
                        handleDeleteCountry(country.id, country.name)
                      }
                      className="px-3 py-1 text-red-400 hover:text-red-600 text-xs font-bold"
                    >
                      delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
