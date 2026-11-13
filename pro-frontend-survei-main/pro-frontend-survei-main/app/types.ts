export interface IResponden {
  id: number
  uuid: string
  jenis_responden: string
  nama: string
  alamat: string
  id_jenis_responden: string
  id_instansi?: string
  provinsi: string
  kab_kota: string
  createdAt: string
  updatedAt: string
  instansi: IInstansi
}

export interface ISurvei {
  id: number
  uuid: string
  nama_survey: string
  deskripsi?: string
  banner_image?: string
  public_link?: string
  jenis_responden: string
  status: boolean
  createdAt: string
  updatedAt: string
  kategori: IKategori[]
  responden_group: IJenisResponden[]
}

export interface IUser {
  id: number
  uuid: string
  nama_user: string
  username: string
  password: string
  role: string
  createdAt: string
  updatedAt: string
  instansi?: IInstansi
}

export interface IKategori {
  id: number
  uuid: string
  id_survey: string
  nama_kategori: string
  deskripsi?: string
  order_index?: number
  createdAt: string
  updatedAt: string
  pertanyaan: IPertanyaan[]
}

export interface IPertanyaan {
  id: number
  uuid: string
  id_kategori: string
  kategori: string
  pertanyaan: string
  deskripsi_bantuan?: string
  jenis: string
  required: boolean
  id_survey: string
  order_index?: number
  for_sub_role?: string
  file_config?: string
  scale_config?: string
  createdAt: string
  updatedAt: string
  opsi_pertanyaan: IOpsiPertanyaan[]
  for_responden_group: IJenisResponden[]
  target_rules?: ILogicRule[]
  source_rules?: ILogicRule[]
}

export interface IOpsiPertanyaan {
  id: number
  uuid: string
  id_pertanyaan: string
  opsi_jawaban: string
  order_index?: number
  ada_catatan: boolean
  keterangan_catatan: string
  goto_kategori_uuid?: string
  createdAt: string
  updatedAt: string
}

export interface ILogicRule {
  id?: number
  uuid?: string
  id_target_pertanyaan: string
  id_source_pertanyaan: string
  id_opsi_pemicu?: string
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'IS_EMPTY' | 'IS_NOT_EMPTY'
  nilai_pemicu?: string
}

export interface IUser {
  id: number
  uuid: string
  nama_user: string
  username: string
  password: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface HasilSurvey {
  id: number
  uuid: string
  id_user: string
  id_survey: string
  id_responden: string
  tipe_responden?: string
  createdAt: string
  updatedAt: string
  survey: ISurvei
  responden: IResponden
  instansi?: IInstansi
  jawaban_survey: JawabanSurvey[]
  dokumen_survey: IDocument[]
  dokumentasi_survey: IDocument[]
  tanda_tangan_responden?: { uuid: string; tanda_tangan: string }[]
  user: { nama_user: string }
}

export interface IDocument {
  id: number
  uuid: string
  id_hasil_survey: string
  nama_file: string
  createdAt: string
  updatedAt: string
}

export interface JawabanSurvey {
  id: number
  uuid: string
  id_hasil_survey: string
  id_pertanyaan: string
  pertanyaan: string
  jenis: string
  jawaban: string | { id_opsi_jawaban: string, text: string } | { id_opsi_jawaban: string, text: string }[]
  catatan: string
  createdAt: string
  updatedAt: string
}

export interface Analys {
  id_pertanyaan: string
  pertanyaan: string
  jenis: string
  analys: string[] | { id_opsi_jawaban: string, text: string, count: number }[]
}

export interface ILokasiPetugas {
  id_survey: string
  nama_survey: string
  id_petugas: string
  nama_petugas: string
  responden: [
    {
      id_responden: string
      nama_responden: string
      jenis_responden: string
    }
  ]
  createdAt: string
  updatedAt: string
}

export interface IInstansi {
  id: number
  uuid: string
  kode_instansi: string
  npsn?: string
  nama_instansi: string
  kota: string
  provinsi: string
  alamat: string
  tipe: "SEKOLAH" | "DINAS"
  id_jenis_responden: string
  user_id: string
  user?: IUser
}
export interface IJenisResponden {
  id: number
  uuid: string
  jenis: string
  is_public: boolean
  tipe: "SEKOLAH" | "DINAS"
  createdAt: string
  updatedAt: string
}

export interface IAssignment {
  id_survey: string
  nama_survey: string
  instansi: { uuid: string; id_instansi: string; nama_instansi: string, id_jenis_responden: string, tipe: string }[]
}