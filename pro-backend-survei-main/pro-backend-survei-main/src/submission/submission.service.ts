import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { QuerySubmissionDto } from './dto/query-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { ROOT_DIRECTORY } from 'src/global';
import { existsSync, unlinkSync } from 'fs';
import { SignatureRespondenDto } from './dto/signature-responden.dto';
import { parsePagination } from 'src/helper/pagination';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuidService: UuidService,
  ) { }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  parseJawaban(jawaban: string): any {
    try {
      if (jawaban) {
        return JSON.parse(jawaban) as string | { id_opsi_jawaban: string, text: string } | { id_opsi_jawaban: string, text: string }[];
      }
      return jawaban;
    } catch (error) {
      return "";
    }
  }

  async findSubmissionAvailable(queryData: QuerySubmissionDto, id_petugas: string) {
    try {
      const { take, skip, page, quantity } = parsePagination(queryData);
      const search = queryData.search?.trim();

      const findAssignment = await this.prisma.assignments.findMany({
        where: { id_petugas }
      })

      const surveys = await this.prisma.survey.findMany({
        where: {
          uuid: { in: findAssignment.map(it => it.id_survey) },
          OR: [
            {
              nama_survey: {
                contains: search || "",
                mode: 'insensitive',
              },
            },
          ],
          status: true,
        },
        skip,
        take,
      });

      const countData = await this.prisma.survey.count({
        where: {
          uuid: { in: findAssignment.map(it => it.id_survey) },
          OR: [
            {
              nama_survey: {
                contains: search || "",
                mode: 'insensitive',
              },
            },
          ],
          status: true
        },
      });

      return {
        success: true,
        message: 'Surveys found successfully',
        data: {
          surveys,
          meta: {
            page: page || 1,
            quantity: quantity,
            total: countData
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error fetching surveys: ${error.message}`,
        data: null
      }
    }
  }

  async findSubmissionInstansiAvailable(queryData: QuerySubmissionDto, id_instansi: string) {
    try {
      const { take, skip, page, quantity } = parsePagination(queryData);
      const search = queryData.search?.trim();

      const findAssignment = await this.prisma.assignments.findMany({
        where: { id_instansi }
      })

      const surveys = await this.prisma.survey.findMany({
        where: {
          uuid: { in: findAssignment.map(it => it.id_survey) },
          OR: [
            {
              nama_survey: {
                contains: search || "",
                mode: 'insensitive',
              },
            },
          ],
          status: true,
        },
        skip,
        take,
      });

      const countData = await this.prisma.survey.count({
        where: {
          uuid: { in: findAssignment.map(it => it.id_survey) },
          OR: [
            {
              nama_survey: {
                contains: search || "",
                mode: 'insensitive',
              },
            },
          ],
          status: true
        },
      });

      return {
        success: true,
        message: 'Surveys found successfully',
        data: {
          surveys,
          meta: {
            page: page || 1,
            quantity: quantity,
            total: countData
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error fetching surveys: ${error.message}`,
        data: null
      }
    }
  }

  async findSubmissionPublicAvailable(queryData: QuerySubmissionDto) {
    try {
      const { id_instansi, id_jenis_responden } = queryData;
      const { take, skip, page, quantity } = parsePagination(queryData);
      const search = queryData.search?.trim();

      const findAssignment = await this.prisma.assignments.findMany({
        where: { id_instansi }
      })

      const surveys = await this.prisma.survey.findMany({
        where: {
          // uuid: { in: findAssignment.map(it => it.id_survey) },
          responden_group: { contains: id_jenis_responden || "" },
          OR: [
            {
              nama_survey: {
                contains: search || "",
                mode: 'insensitive',
              },
            },
          ],
          status: true,
        },
        skip,
        take,
      });

      const countData = await this.prisma.survey.count({
        where: {
          // uuid: { in: findAssignment.map(it => it.id_survey) },
          OR: [
            {
              nama_survey: {
                contains: search || "",
                mode: 'insensitive',
              },
            },
          ],
          status: true
        },
      });

      return {
        success: true,
        message: 'Surveys found successfully',
        data: {
          surveys,
          meta: {
            page: page || 1,
            quantity: quantity,
            total: countData
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error fetching surveys: ${error.message}`,
        data: null
      }
    }
  }

  async create(createSubmissionDto: CreateSubmissionDto, id_user: string) {
    try {
      const { id_instansi, id_survey, nama, id_jenis_responden } = createSubmissionDto
      const findInstansi = await this.prisma.instansi.findFirst({ where: { uuid: id_instansi } })
      if (!findInstansi) {
        return {
          success: false,
          message: `Instansi tidak ditemukan`,
          data: null
        }
      }

      const findSurvey = await this.prisma.survey.findFirst({ where: { uuid: id_survey } })
      if (!findSurvey) {
        return {
          success: false,
          message: `Survei tidak ditemukan`,
          data: null
        }
      }

      const createResponden = await this.prisma.responden.create({
        data: {
          uuid: this.uuidService.generateUUID(),
          id_jenis_responden,
          jenis_responden: findSurvey.jenis_responden,
          alamat: findInstansi.alamat,
          kab_kota: findInstansi.kota,
          provinsi: findInstansi.provinsi,
          nama,
          id_instansi: findInstansi.uuid,
        }
      })

      // Generate a unique ID for the new hasil survey
      const id = this.uuidService.generateUUID();

      const HasilSurvey = await this.prisma.hasil_survey.create({
        data: {
          uuid: id,
          id_user: id_user,
          id_instansi: findInstansi.uuid,
          id_responden: createResponden.uuid,
          id_survey: createSubmissionDto.id_survey
        },
      });

      // Create the new jawaban in the database
      // Bentuk array data untuk createMany
      const jawabanData = createSubmissionDto.jawaban.map((item) => ({
        uuid: this.uuidService.generateUUID(),
        id_hasil_survey: id,
        id_pertanyaan: item.id_pertanyaan,
        jawaban: item.jawaban,
        catatan: item.catatan || "",
        pertanyaan: "",
        jenis: ""
      }));

      /** get pertanyaan */
      const arrIdPertanyaan = jawabanData.map(it => it.id_pertanyaan)
      const pertanyaan = await this.prisma.pertanyaan.findMany({
        where: { uuid: { in: arrIdPertanyaan } }
      })

      for (let i = 0; i < jawabanData.length; i++) {
        const findPertanyaan = pertanyaan.find(item =>
          item.uuid === jawabanData[i].id_pertanyaan
        )
        jawabanData[i].pertanyaan = findPertanyaan?.pertanyaan || ""
        jawabanData[i].jenis = findPertanyaan?.jenis || ""
      }

      // Simpan semua jawaban ke database
      const result = await this.prisma.jawaban_survey.createMany({
        data: jawabanData,
        skipDuplicates: true, // opsional
      });

      return {
        success: true,
        message: 'Jawaban created successfully',
        data: HasilSurvey
      }
    } catch (error) {
      return {
        success: false,
        message: `Error creating jawaban: ${error.message}`,
        data: null
      }
    }
  }

  async createPublic(createSubmissionDto: CreateSubmissionDto) {
    try {
      const { id_instansi, id_survey, nama } = createSubmissionDto
      const findInstansi = await this.prisma.instansi.findFirst({ where: { uuid: id_instansi } })
      if (!findInstansi) {
        return {
          success: false,
          message: `Instansi tidak ditemukan`,
          data: null
        }
      }

      const findSurvey = await this.prisma.survey.findFirst({ where: { uuid: id_survey } })
      if (!findSurvey) {
        return {
          success: false,
          message: `Survei tidak ditemukan`,
          data: null
        }
      }

      const id_jenis_responden = createSubmissionDto.id_jenis_responden || findInstansi.id_jenis_responden || "";

      const createResponden = await this.prisma.responden.create({
        data: {
          uuid: this.uuidService.generateUUID(),
          id_jenis_responden,
          jenis_responden: findSurvey.jenis_responden,
          alamat: findInstansi.alamat,
          kab_kota: findInstansi.kota,
          provinsi: findInstansi.provinsi,
          nama,
          id_instansi: findInstansi.uuid
        }
      })

      let subRespondenUuid: string | null = null;
      if (createSubmissionDto.sub_role && createSubmissionDto.nomor_identitas) {
        const subRoleEnum = (['SISWA', 'GURU', 'KEPALA_SEKOLAH'].includes(createSubmissionDto.sub_role)
          ? createSubmissionDto.sub_role
          : 'SISWA') as any;
        const subResponden = await this.prisma.responden_sekolah.create({
          data: {
            uuid: this.uuidService.generateUUID(),
            id_instansi: findInstansi.uuid,
            sub_role: subRoleEnum,
            nomor_identitas: createSubmissionDto.nomor_identitas,
            nama_lengkap: nama,
          },
        });
        subRespondenUuid = subResponden.uuid;
      }

      const findAssignment = await this.prisma.assignments.findFirst({
        include: { petugas: true },
        where: {
          id_instansi, id_survey
        }
      })

      // Resolve valid user foreign key: assigned petugas -> instansi account user -> survey creator
      const targetUserId = findAssignment?.petugas?.uuid || findAssignment?.id_petugas || findInstansi.user_id || findSurvey.id_user;

      // Generate a unique ID for the new hasil survey
      const id = this.uuidService.generateUUID();

      const HasilSurvey = await this.prisma.hasil_survey.create({
        data: {
          uuid: id,
          id_user: targetUserId,
          id_instansi: findInstansi.uuid,
          id_responden: createResponden.uuid,
          id_responden_sekolah: subRespondenUuid,
          id_survey: createSubmissionDto.id_survey
        },
      });

      // Create the new jawaban in the database
      // Bentuk array data untuk createMany
      const jawabanData = createSubmissionDto.jawaban.map((item) => ({
        uuid: this.uuidService.generateUUID(),
        id_hasil_survey: id,
        id_pertanyaan: item.id_pertanyaan,
        jawaban: item.jawaban,
        catatan: item.catatan || "",
        pertanyaan: "",
        jenis: ""
      }));

      /** get pertanyaan */
      const arrIdPertanyaan = jawabanData.map(it => it.id_pertanyaan)
      const pertanyaan = await this.prisma.pertanyaan.findMany({
        where: { uuid: { in: arrIdPertanyaan } }
      })

      for (let i = 0; i < jawabanData.length; i++) {
        const findPertanyaan = pertanyaan.find(item =>
          item.uuid === jawabanData[i].id_pertanyaan
        )
        jawabanData[i].pertanyaan = findPertanyaan?.pertanyaan || ""
        jawabanData[i].jenis = findPertanyaan?.jenis || ""
      }

      // Simpan semua jawaban ke database
      const result = await this.prisma.jawaban_survey.createMany({
        data: jawabanData,
        skipDuplicates: true, // opsional
      });

      return {
        success: true,
        message: 'Jawaban created successfully',
        data: HasilSurvey
      }
    } catch (error) {
      return {
        success: false,
        message: `Error creating jawaban: ${error.message}`,
        data: null
      }
    }
  }

  async upload_documents(
    id_hasil_survey: string,
    documents: Express.Multer.File[]
  ) {
    try {
      const documentFilename = documents.map(it => `${it.filename}`)
      const evidenDocuments: { uuid: string, id_hasil_survey: string, nama_file: string }[] = []
      for (let i = 0; i < documentFilename.length; i++) {
        evidenDocuments.push({
          uuid: this.uuidService.generateUUID(),
          id_hasil_survey: id_hasil_survey,
          nama_file: documentFilename[i]
        })
      }
      const result = await this.prisma.dokumen_survey.createMany({ data: evidenDocuments })
      return {
        success: true,
        message: 'Documents has been uploaded',
        data: result
      }

    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async remove_document(id: string) {
    try {
      const findDocument = await this.prisma.dokumen_survey.findFirst({ where: { uuid: id } })
      if (!findDocument) {
        return {
          success: false,
          data: null,
          message: `Document doesn't exists`
        }
      }
      const { nama_file } = findDocument
      const path = `${ROOT_DIRECTORY}/public/documents/${nama_file}`
      if (existsSync(path) && nama_file !== "") unlinkSync(path)
      const result = await this.prisma.dokumen_survey.delete({ where: { uuid: id } })
      return {
        success: true,
        data: result,
        message: `Document has removed`
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async remove_documentation(id: string) {
    try {
      const findDocument = await this.prisma.dokumentasi_survey.findFirst({ where: { uuid: id } })
      if (!findDocument) {
        return {
          success: false,
          data: null,
          message: `Documentation doesn't exists`
        }
      }
      const { nama_file } = findDocument
      const path = `${ROOT_DIRECTORY}/public/documentations/${nama_file}`
      if (existsSync(path) && nama_file !== "") unlinkSync(path)
      const result = await this.prisma.dokumentasi_survey.delete({ where: { uuid: id } })
      return {
        success: true,
        data: result,
        message: `Documentation has removed`
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async upload_documentations(
    id_hasil_survey: string,
    documentations: Express.Multer.File[]
  ) {
    try {
      const documentFilename = documentations.map(it => `${it.filename}`)
      const evidenDocuments: { uuid: string, id_hasil_survey: string, nama_file: string }[] = []
      for (let i = 0; i < documentFilename.length; i++) {
        evidenDocuments.push({
          uuid: this.uuidService.generateUUID(),
          id_hasil_survey: id_hasil_survey,
          nama_file: documentFilename[i]
        })
      }
      const result = await this.prisma.dokumentasi_survey.createMany({ data: evidenDocuments })
      return {
        success: true,
        message: 'Documentations has been uploaded',
        data: result
      }

    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async create_upload(
    id_hasil_survey: string,
    documentation_files: Express.Multer.File[],
    document_files: Express.Multer.File[],
  ) {
    try {
      const findDocumentation = await this.prisma.dokumentasi_survey.findFirst({
        where: { id_hasil_survey }
      })
      const findDocument = await this.prisma.dokumentasi_survey.findFirst({
        where: { id_hasil_survey }
      })
      if (findDocumentation || findDocument) {
        return {
          success: false,
          message: 'Documents and Documentations are uploaded',
          data: null
        }
      }

      for (let i = 0; i < document_files.length; i++) {
        const filename = document_files[i].filename
        const path = `${ROOT_DIRECTORY}/public/documents/${filename}`
        if (existsSync(path) && filename !== "") unlinkSync(path)
      }

      for (let i = 0; i < document_files.length; i++) {
        const filename = document_files[i].filename
        const path = `${ROOT_DIRECTORY}/public/documents/${filename}`
        if (existsSync(path) && filename !== "") unlinkSync(path)
      }

      const documentFilename = document_files.map(it => `${it.filename}`)
      let evidenDocuments = [{
        uuid: "",
        id_hasil_survey: "",
        nama_file: ""
      }]
      for (let i = 0; i < documentFilename.length; i++) {
        evidenDocuments.push({
          uuid: this.uuidService.generateUUID(),
          id_hasil_survey: id_hasil_survey,
          nama_file: documentFilename[i]
        })
      }
      await this.prisma.dokumen_survey.createMany({ data: evidenDocuments })

      const documentationFilename = documentation_files.map(it => `${it.filename}`)
      let evidenDocumentations = [{
        uuid: "",
        id_hasil_survey: "",
        nama_file: ""
      }]
      for (let i = 0; i < documentationFilename.length; i++) {
        evidenDocumentations.push({
          uuid: this.uuidService.generateUUID(),
          id_hasil_survey: id_hasil_survey,
          nama_file: documentationFilename[i]
        })
      }
      const newUpload = await this.prisma.dokumentasi_survey.createMany({ data: evidenDocumentations })

      return {
        success: true,
        message: 'Submission created successfully',
        data: newUpload
      }

    } catch (error) {
      return {
        success: false,
        message: `Error ${error.message}`,
        data: null
      }
    }
  }

  async createSignature(signatureRespondenDto: SignatureRespondenDto) {
    try {
      const findTTD = await this.prisma.tanda_tangan_responden.findFirst({ where: { id_hasil_survey: signatureRespondenDto.id_hasil_survey } })
      const { top, width, left, ttd, id_hasil_survey, nama_responden } = signatureRespondenDto;
      let saveSignature
      if (findTTD) {
        saveSignature = await this.prisma.tanda_tangan_responden.update({
          data: {
            ttd, top: Number(top), width: Number(width), left: Number(left), nama_responden
          },
          where: { uuid: findTTD.uuid }
        })
      } else {
        saveSignature = await this.prisma.tanda_tangan_responden.create({
          data: {
            uuid: this.uuidService.generateUUID(),
            ttd, top: Number(top), width: Number(width), left: Number(left), nama_responden: nama_responden
          }
        })
      }
      return {
        success: true,
        message: 'tandatangan created',
        data: saveSignature
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
    // return `This action returns a #${id} petugas`;
  }

  async findAll(queryData: QuerySubmissionDto, id_user: string) {
    try {
      const { id_survey } = queryData;
      const { take, skip, page, quantity } = parsePagination(queryData);
      const search = queryData.search?.trim();

      const allJenisResponden = await this.prisma.jenis_responden.findMany()
      const hasil_surveys = await this.prisma.hasil_survey.findMany({
        where: {
          id_user,
          id_survey,
          OR: [
            { responden: { nama: { contains: search ?? '', mode: 'insensitive' } } },
            { user: { nama_user: { contains: search ?? '', mode: 'insensitive' } } }
          ]
        },
        include: {
          survey: true,
          responden: {
            include: {
              instansi: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: `desc` }
      });

      const countData = await this.prisma.hasil_survey.count({
        where: {
          id_user,
          id_survey,
          OR: [
            { responden: { nama: { contains: search ?? '', mode: 'insensitive' } } },
            { user: { nama_user: { contains: search ?? '', mode: 'insensitive' } } }
          ]
        },
      });

      return {
        success: true,
        message: 'Hasil Surveys found successfully',
        data: {
          hasil_surveys: hasil_surveys.map(it => {
            const jenisResponden = allJenisResponden.find(jr => jr.uuid === it.responden.id_jenis_responden)
            return {
              ...it,
              tipe_responden: jenisResponden ? jenisResponden.jenis : "Tidak Diketahui"
            }
          }),
          meta: {
            page: page || 1,
            quantity: quantity,
            total: countData
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error fetching hasil surveys: ${error.message}`,
        data: null
      }
    }
  }

  async findOne(id: string) {
    try {
      const findHasilSurvey = await this.prisma.hasil_survey.findFirst({
        where: { uuid: id },
        include: {
          survey: true, responden: true, instansi: true,
          jawaban_survey: true,
          dokumen_survey: true,
          dokumentasi_survey: true,
          tanda_tangan_responden: true,
          user: true
        }
      })
      if (!findHasilSurvey) {
        return {
          success: false,
          message: `Hasil Survey does not exists`,
          data: null
        }
      }
      for (let i = 0; i < findHasilSurvey.jawaban_survey.length; i++) {
        if (findHasilSurvey.jawaban_survey[i].jenis != "ISIAN") {
          let json = this.parseJawaban(findHasilSurvey.jawaban_survey[i].jawaban)
          findHasilSurvey.jawaban_survey[i].jawaban = json
        }
      }
      return {
        success: true,
        message: `Hasil survey has retrieved`,
        data: findHasilSurvey
      }
    } catch (error) {
      return new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findResultCount() {
    try {
      const findJumlah = await this.prisma.survey.findMany({
        include: {
          _count: {
            select: {
              hasil_survey: true
            }
          }
        }
      })
      if (!findJumlah) {
        return {
          success: false,
          message: `Hasil Survey does not exists`,
          data: null
        }
      }
      return {
        success: true,
        message: `Hasil survey has retrieved`,
        data: findJumlah
      }
    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async findSubmissionResult(queryData: QuerySubmissionDto) {
    try {
      // const { page, quantity, search } = queryData
      // const take: number | undefined = quantity
      // const skip: number | undefined = page && quantity ? (page - 1) * quantity : undefined

      // const jumlah_terkumpul = await this.prisma.survey.findMany({
      //   include: {
      //     _count: {
      //       select: {
      //         hasil_survey: true
      //       }
      //     }
      //   }
      // })

      // const jumlah_responden_terkumpul = await this.prisma.$queryRaw`SELECT s.jenis_responden, COUNT(h.id) as jumlah
      // FROM hasil_survey h
      // JOIN survey s ON h.id_survey = s.uuid
      // GROUP BY s.jenis_responden`;

      const { id_survey, id_kategori } = queryData
      const pertanyaans = await this.prisma.pertanyaan.findMany({
        where: {
          id_survey, id_kategori
        },
        include: { opsi_pertanyaan: true }
      });

      const arrIdPertanyaan = pertanyaans.map(it => it.uuid)
      const jawaban = await this.prisma.jawaban_survey.findMany({
        where: {
          id_pertanyaan: { in: arrIdPertanyaan }
        }
      })

      const analys: {
        id_pertanyaan: string
        pertanyaan: string
        jenis: string
        analys: string[] | { id_opsi_jawaban: string, text: string, count: number }[]
      }[] = []
      for (let i = 0; i < pertanyaans.length; i++) {
        const { uuid, pertanyaan, jenis } = pertanyaans[i]
        if (jenis === `ISIAN`) {
          const answer = jawaban
            .filter(it => it.id_pertanyaan === uuid)
            .map(it => it.jawaban)
          analys.push({
            id_pertanyaan: uuid,
            pertanyaan,
            jenis,
            analys: answer
          })
        }
        else if (jenis === `PILIHAN`) {
          const { opsi_pertanyaan } = pertanyaans[i]
          const answer = jawaban
            .filter(it => it.id_pertanyaan === uuid)
            .map(it => JSON.parse(it.jawaban))

          const tempAnalys: { id_opsi_jawaban: string, text: string, count: number }[] = []
          for (let x = 0; x < opsi_pertanyaan.length; x++) {
            const { uuid, opsi_jawaban } = opsi_pertanyaan[x]
            const count = answer.filter(it => it.id_opsi_jawaban === uuid).length
            tempAnalys.push({
              id_opsi_jawaban: uuid,
              text: opsi_jawaban,
              count
            })
          }

          analys.push({
            id_pertanyaan: uuid,
            pertanyaan,
            jenis,
            analys: tempAnalys
          })

        }

        else if (jenis === `CHECKBOX`) {
          const { opsi_pertanyaan } = pertanyaans[i]
          const answer = jawaban
            .filter(it => it.id_pertanyaan === uuid)
            .flatMap(it => JSON.parse(it.jawaban))

          const tempAnalys: { id_opsi_jawaban: string, text: string, count: number }[] = []
          for (let x = 0; x < opsi_pertanyaan.length; x++) {
            const { uuid, opsi_jawaban } = opsi_pertanyaan[x]
            const count = answer.filter(it => it.id_opsi_jawaban === uuid).length
            tempAnalys.push({
              id_opsi_jawaban: uuid,
              text: opsi_jawaban,
              count,
            })
          }

          analys.push({
            id_pertanyaan: uuid,
            pertanyaan,
            jenis,
            analys: tempAnalys
          })

        }
      }

      // const result_pengisian = {
      //   ...pertanyaans,
      //   jawaban
      // }

      // const result_pengisian = pertanyaans.map(async (pertanyaan) => {
      //   const jawabanPertanyaan = jawaban.filter(j => j.id_pertanyaan === pertanyaan.uuid);

      //   if (pertanyaan.jenis === 'PILIHAN') {
      //     // Hitung jumlah masing-masing opsi jawaban
      //     const rekap: Record<string, number> = {};

      //     for (const j of jawabanPertanyaan) {
      //       try {
      //         const parsed = JSON.parse(j.jawaban); // { id_opsi_jawaban: '...' }
      //         const id_opsi = parsed.id_opsi_jawaban;

      //         if (id_opsi) {
      //           rekap[id_opsi] = (rekap[id_opsi] || 0) + 1;
      //         }
      //       } catch (err) {
      //         console.warn('Jawaban tidak valid JSON:', j.jawaban);
      //       }
      //     }

      //     // Optional: ambil teks jawaban dari tabel opsi_jawaban
      //     const opsi = await this.prisma.opsi_pertanyaan.findMany({
      //       where: { id_pertanyaan: pertanyaan.uuid }
      //     });

      //     const rekapLengkap = opsi.map(o => ({
      //       id_opsi_jawaban: o.uuid,
      //       opsi_jawaban: o.opsi_jawaban,
      //       jumlah: rekap[o.uuid] || 0
      //     }));

      //     return {
      //       uuid: pertanyaan.uuid,
      //       isi: pertanyaan.pertanyaan,
      //       jenis: pertanyaan.jenis,
      //       rekap: rekapLengkap
      //     };

      //   } else {
      //     // Untuk jenis ISIAN, tampilkan semua jawaban seperti biasa
      //     return {
      //       uuid: pertanyaan.uuid,
      //       isi: pertanyaan.pertanyaan,
      //       jenis: pertanyaan.jenis,
      //       jawaban: jawabanPertanyaan.map(j => j.jawaban)
      //     };
      //   }
      // });

      return {
        success: true,
        message: 'Hasil Surveys found successfully',
        data: {
          // jumlah_terkumpul,
          // jumlah_responden_terkumpul,
          analys
          // meta: {
          //   page: page || 1,
          //   quantity: quantity,
          //   total: countData
          // }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error fetching hasil surveys: ${error.message}`,
        data: null
      }
    }
  }

  async findAllAdmin(queryData: QuerySubmissionDto) {
    try {
      const { id_survey } = queryData;
      const { take, skip, page, quantity } = parsePagination(queryData);
      const search = queryData.search?.trim();

      const hasil_surveys = await this.prisma.hasil_survey.findMany({
        where: {
          id_survey,
          OR: [
            { responden: { nama: { contains: search ?? '', mode: 'insensitive' } } },
            { user: { nama_user: { contains: search ?? '', mode: 'insensitive' } } }
          ]
        },
        include: {
          survey: true,
          responden: {
            include: {
              instansi: true,
            }
          },
          user: true
        },
        skip,
        take,
        orderBy: { createdAt: `desc` }
      });

      const allJenisResponden = await this.prisma.jenis_responden.findMany()

      const countData = await this.prisma.hasil_survey.count({
        where: {
          id_survey,
          OR: [
            { responden: { nama: { contains: search ?? '', mode: 'insensitive' } } },
            { user: { nama_user: { contains: search ?? '', mode: 'insensitive' } } }
          ]
        },
      });

      return {
        success: true,
        message: 'Hasil Surveys found successfully',
        data: {
          hasil_surveys: hasil_surveys.map(it => {
            const jenisResponden = allJenisResponden.find(jr => jr.uuid === it.responden.id_jenis_responden)
            return {
              ...it,
              tipe_responden: jenisResponden ? jenisResponden.jenis : "Tidak Diketahui"
            }
          }),
          meta: {
            page: page || 1,
            quantity: quantity,
            total: countData
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error fetching hasil surveys: ${error.message}`,
        data: null
      }
    }
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto, id_user: string) {
    try {
      const { id_survey } = updateSubmissionDto
      const findHasilSurvey = await this.prisma.hasil_survey.findFirst({ where: { uuid: id } })
      if (!findHasilSurvey) {
        return {
          success: false,
          message: `Hasil Survey does  ot exists`,
          data: null
        }
      }

      const updateHasilSurvey = await this.prisma.hasil_survey.update({
        where: { uuid: id },
        data: {
          id_responden: findHasilSurvey.id_responden,
          id_survey: id_survey ?? findHasilSurvey.id_survey,
          id_user: id_user ?? findHasilSurvey.id_user
        }
      })

      // Delete jawaban
      const deleteJawaban = await this.prisma.jawaban_survey.deleteMany({
        where: { id_hasil_survey: id }
      })

      // Create the new jawaban in the database
      // Bentuk array data untuk createMany
      const jawabanData = updateSubmissionDto.jawaban.map((item) => ({
        uuid: this.uuidService.generateUUID(),
        id_hasil_survey: id,
        id_pertanyaan: item.id_pertanyaan,
        jawaban: item.jawaban,
        catatan: item.catatan || "",
        pertanyaan: "",
        jenis: ""
      }));

      /** get pertanyaan */
      const arrIdPertanyaan = jawabanData.map(it => it.id_pertanyaan)
      const pertanyaan = await this.prisma.pertanyaan.findMany({
        where: { uuid: { in: arrIdPertanyaan } }
      })

      for (let i = 0; i < jawabanData.length; i++) {
        const findPertanyaan = pertanyaan.find(item =>
          item.uuid === jawabanData[i].id_pertanyaan
        )
        jawabanData[i].pertanyaan = findPertanyaan?.pertanyaan || ""
        jawabanData[i].jenis = findPertanyaan?.jenis || ""
      }

      // Simpan semua jawaban ke database
      const result = await this.prisma.jawaban_survey.createMany({
        data: jawabanData,
        skipDuplicates: true, // opsional
      });

      return {
        success: true,
        message: `Hasil Survey has updated`,
        data: updateHasilSurvey
      }


    } catch (error) {
      new InternalServerErrorException(`Something were wrong. ${error}`)
    }
  }

  async remove(id: string) {
    try {
      const findSubmission = await this.prisma.hasil_survey.findFirst({
        where: {
          uuid: id
        }
      })
      if (!findSubmission) {
        return {
          success: false,
          message: `Submission does not exists`,
          data: null
        }
      }

      const deletedTtd = await this.prisma.tanda_tangan_responden.deleteMany({
        where: {
          id_hasil_survey: id
        }
      })
      const findDocumentations = await this.prisma.dokumentasi_survey.findMany({ where: { id_hasil_survey: id } })
      for (let i = 0; i < findDocumentations.length; i++) {
        const filename = findDocumentations[i].nama_file
        const path = `${ROOT_DIRECTORY}/public/documentations/${filename}`
        if (existsSync(path) && filename !== "") unlinkSync(path)
      }

      const deletedDok = await this.prisma.dokumentasi_survey.deleteMany({
        where: {
          id_hasil_survey: id
        }
      })

      const findDoc = await this.prisma.dokumen_survey.findMany({ where: { id_hasil_survey: id } })
      for (let i = 0; i < findDoc.length; i++) {
        const filename = findDoc[i].nama_file
        const path = `${ROOT_DIRECTORY}/public/documents/${filename}`
        if (existsSync(path) && filename !== "") unlinkSync(path)
      }
      const deletedDokumen = await this.prisma.dokumen_survey.deleteMany({
        where: {
          id_hasil_survey: id
        }
      })
      const deletedJawaban = await this.prisma.jawaban_survey.deleteMany({
        where: {
          id_hasil_survey: id
        }
      })
      const deletedHasilSurvey = await this.prisma.hasil_survey.delete({
        where: {
          uuid: id
        }
      })
      return {
        success: true,
        message: `Submission has deleted`,
        data: deletedHasilSurvey
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }
}
