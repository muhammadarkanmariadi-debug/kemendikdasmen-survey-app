import { Analys, IKategori, ISurvei } from "@/app/types";
import { BASE_API_URL, TOKEN_KEY_ADMIN } from "@/global";
import { get } from "@/helper/api-bridge";
import { getCookies } from "@/helper/server-cookie";
import FilterSurvey from "./filterSurvei";
import FilterKategori from "./filterKategori";
import HorizontalBarChart from "@/components/BarChart";
import PieCharts from "@/components/PieChart";
import DownloadExcel from "./downloadExcel";
import { ClipboardList, CheckCircle2, BarChart3, HelpCircle, Layers, FileSpreadsheet } from "lucide-react";

const getSurvei = async (): Promise<ISurvei[]> => {
  try {
    const url = `${BASE_API_URL}/surveys/kategori`;
    const token = await getCookies(TOKEN_KEY_ADMIN);
    const { data } = await get(url, token);
    if (data?.success === true) return [...data.data];
    return [];
  } catch (error) {
    console.error("Error getSurvei:", error);
    return [];
  }
};

const getAnalysSurvei = async (id_survei?: string, id_kategori?: string): Promise<Analys[]> => {
  try {
    const url = `${BASE_API_URL}/submission/result?id_survey=${id_survei}${id_kategori !== "" ? `&id_kategori=${id_kategori}` : ""}`;
    const token = await getCookies(TOKEN_KEY_ADMIN);
    const { data } = await get(url, token);
    if (data?.success === true) return [...data.data.analys];
    return [];
  } catch (error) {
    console.error("Error getAnalysSurvei:", error);
    return [];
  }
};

type Props = {
  searchParams: Promise<{
    id_survei?: string;
    id_kategori?: string;
    provinsi?: string;
  }>;
};

const DashboardPage = async (props: Props) => {
  const { id_kategori = "", id_survei = "" } = (await props.searchParams) || {};
  const surveys = await getSurvei();
  let categories: IKategori[] = [];
  let nama_survey = "";

  if (id_survei !== "") {
    const findSurvey = surveys.find((it) => it.uuid === id_survei);
    if (findSurvey) {
      categories = findSurvey.kategori;
      nama_survey = findSurvey.nama_survey;
    }
  }

  const analys = await getAnalysSurvei(id_survei, id_kategori);
  const activeSurveysCount = surveys.filter((s) => s.status === true).length;

  return (
    <div className="w-full space-y-6">
      {/* Top Welcome & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B5C9E] flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Instrumen
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{surveys.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Instrumen Aktif
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{activeSurveysCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Butir Dianalisis
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{analys.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Section Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Filter Visualisasi Hasil Kuesioner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih kuesioner dan kategori bagian untuk menampilkan agregasi data jawaban responden.
            </p>
          </div>
          {id_survei !== "" && (
            <div className="shrink-0">
              <DownloadExcel id={id_survei} nama={nama_survey} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Kuesioner
            </label>
            <FilterSurvey url="/admin/dashboard" surveys={surveys} id_survey={id_survei || ""} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Bagian / Kategori
            </label>
            <FilterKategori
              url={`/admin/dashboard?id_survei=${id_survei}`}
              categories={categories}
              id_kategori={id_kategori || ""}
            />
          </div>
        </div>
      </div>

      {/* Analytics Results Area */}
      <div className="space-y-5">
        {id_survei === "" ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Silakan Pilih Kuesioner</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Pilih salah satu kuesioner pada pilihan di atas untuk memuat bagan diagram dan rekap jawaban responden.
            </p>
          </div>
        ) : analys.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Belum Ada Data Jawaban</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Belum ada responden yang mengisi kuesioner ini, atau belum ada butir pertanyaan pada kategori yang dipilih.
            </p>
          </div>
        ) : (
          analys.map((analisis, index) => (
            <div
              key={`keyAnalys-${index}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
            >
              {/* Question Card Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#0B5C9E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div
                    className="text-sm font-bold text-slate-900 leading-snug"
                    dangerouslySetInnerHTML={{ __html: analisis.pertanyaan }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0B5C9E] border border-blue-200/60">
                      Tipe: {analisis.jenis}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart / Answer Output */}
              <div className="p-6">
                {analisis.jenis === "ISIAN" ? (
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block mb-2">
                      Daftar Isian Teks Responden:
                    </span>
                    <div className="max-h-60 rounded-xl border border-slate-200 overflow-y-auto divide-y divide-slate-100 bg-slate-50/40">
                      {(analisis.analys as string[]).length === 0 ? (
                        <p className="p-4 text-xs text-slate-400 text-center italic">
                          Belum ada jawaban teks untuk butir ini.
                        </p>
                      ) : (
                        (analisis.analys as string[]).map((answer, indexAnswer) => (
                          <div
                            key={`keyIsian-${index}-${indexAnswer}`}
                            className="p-3 text-xs text-slate-700 hover:bg-white transition-colors"
                          >
                            {answer}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-center py-2">
                    {analisis.jenis === "CHECKBOX" ? (
                      <div className="w-full">
                        <HorizontalBarChart
                          height={360}
                          datasets={(
                            analisis.analys as {
                              id_opsi_jawaban: string;
                              text: string;
                              count: number;
                            }[]
                          )
                            .map((item) => ({ name: item.text, value: item.count }))
                            .sort((a, b) => a.value - b.value)}
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-lg">
                        <PieCharts
                          datasets={(
                            analisis.analys as {
                              id_opsi_jawaban: string;
                              text: string;
                              count: number;
                            }[]
                          ).map((item) => ({ name: item.text, value: item.count }))}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const dynamic = "force-dynamic";
export default DashboardPage;
