import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { QuerySurveyDto } from './dto/query-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UuidService } from 'src/uuid/uuid.service';
import { parsePagination } from 'src/helper/pagination';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as cheerio from 'cheerio';
import { parseDocument } from 'htmlparser2';

type IJenisResponden = {
  id: number
  uuid: string
  jenis: string
  is_public: boolean
  tipe: "SEKOLAH" | "DINAS"
  createdAt: string
  updatedAt: string
}
@Injectable()
export class SurveysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuid: UuidService,
  ) { }

  parseRespondenGroup = (data: string): IJenisResponden[] => {
    try {
      return JSON.parse(data)
    } catch (error) {
      return []
    }
  }
  async create(createSurveyDto: CreateSurveyDto, id_user: string) {
    try {
      const { nama_survey, jenis_responden, status, responden_group } = createSurveyDto

      const createSurvey = await this.prisma.survey.create({
        data: {
          uuid: this.uuid.generateUUID(),
          id_user: id_user,
          nama_survey,
          jenis_responden,
          status,
          responden_group: responden_group ?? '',
        },
      });

      return {
        success: true,
        message: 'Survey created successfully',
        data: createSurvey,
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findAll(querySurveyDto: QuerySurveyDto) {
    try {
      const { take, skip, page, quantity } = parsePagination(querySurveyDto);
      const search = querySurveyDto.search?.trim();

      const whereCondition: any = search ? {
        OR: [
          { nama_survey: { contains: search } },
          { deskripsi: { contains: search } }
        ]
      } : {};

      const findSurvey = await this.prisma.survey.findMany({
        where: whereCondition,
        take, skip,
        orderBy: { createdAt: `desc` }
      })

      const totalSurvey = await this.prisma.survey.count({
        where: whereCondition,
      })

      return {
        success: true,
        message: 'Survey found successfully',
        data: findSurvey.map(survey => {
          return {
            ...survey,
            responden_group: this.parseRespondenGroup(survey.responden_group),
          }
        }),
        meta: {
          page: page ?? 1,
          quantity: quantity ?? totalSurvey,
          totalData: totalSurvey,
        },
      }

    } catch (error) {
      console.error('Error in surveys.findAll:', error);
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const findSurvey = await this.prisma.survey.findFirst({
        where: {
          uuid: id,
        },
      })
      if (!findSurvey) {
        return {
          success: false,
          message: `Survey does not exists`,
          data: null
        }
      }
      return {
        success: true,
        message: 'Survey found successfully',
        data: {
          ...findSurvey,
          responden_group: this.parseRespondenGroup(findSurvey.responden_group),
        },
      }

    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findKategori() {
    try {

      const findSurvey = await this.prisma.survey.findMany({
        include: {
          kategori: true
        },
        orderBy: { createdAt: `desc` }
      })

      return {
        success: true,
        message: 'Survey found successfully',
        data: findSurvey,
      }

    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findAllPublicSurveys() {
    try {
      const surveys = await this.prisma.survey.findMany({
        where: { status: true },
        orderBy: { createdAt: 'desc' },
        select: {
          uuid: true,
          nama_survey: true,
          deskripsi: true,
          public_link: true,
          createdAt: true,
          _count: {
            select: {
              kategori: true,
              assignments: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Daftar survei publik aktif berhasil diambil',
        data: surveys,
      };
    } catch (error) {
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async findPublicSurvey(public_link: string) {
    try {
      const findSurvey = await this.prisma.survey.findFirst({
        where: {
          OR: [
            { public_link: public_link },
            { uuid: public_link }
          ],
          status: true,
        },
        include: {
          kategori: {
            orderBy: { order_index: 'asc' },
            include: {
              pertanyaan: {
                orderBy: { order_index: 'asc' },
                include: {
                  opsi_pertanyaan: {
                    orderBy: { order_index: 'asc' },
                  },
                  target_rules: true,
                  source_rules: true,
                },
              },
            },
          },
        },
      });

      if (!findSurvey) {
        return {
          success: false,
          message: 'Survei publik tidak ditemukan atau sedang dinonaktifkan',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Survei publik berhasil ditemukan',
        data: {
          ...findSurvey,
          responden_group: this.parseRespondenGroup(findSurvey.responden_group),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async getAssignedInstitutionsByPublicLink(public_link: string) {
    try {
      const survey = await this.prisma.survey.findFirst({
        where: {
          OR: [
            { public_link: public_link },
            { uuid: public_link }
          ],
          status: true,
        },
      });

      if (!survey) {
        return {
          success: false,
          message: 'Survei tidak ditemukan atau sedang dinonaktifkan',
          data: null,
        };
      }

      const assignments = await this.prisma.assignments.findMany({
        where: { id_survey: survey.uuid },
        include: {
          instansi: true,
        },
      });

      const instansiMap = new Map();
      for (const a of assignments) {
        if (a.instansi && !instansiMap.has(a.instansi.uuid)) {
          instansiMap.set(a.instansi.uuid, {
            uuid: a.instansi.uuid,
            nama_instansi: a.instansi.nama_instansi,
            npsn: a.instansi.npsn || a.instansi.kode_instansi,
            kota: a.instansi.kota,
            provinsi: a.instansi.provinsi,
            alamat: a.instansi.alamat,
          });
        }
      }

      return {
        success: true,
        message: 'Daftar instansi survei berhasil diambil',
        data: {
          survey: {
            uuid: survey.uuid,
            nama_survey: survey.nama_survey,
            deskripsi: survey.deskripsi,
            public_link: survey.public_link || survey.uuid,
          },
          institutions: Array.from(instansiMap.values()),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async update(id: string, updateSurveyDto: UpdateSurveyDto, id_user: string) {
    try {
      const { nama_survey, jenis_responden, status, responden_group } = updateSurveyDto
      const findSurvey = await this.prisma.survey.findFirst({
        where: {
          uuid: id,
        },
      })
      if (!findSurvey) {
        return {
          success: false,
          message: `Survey does not exists`,
          data: null
        }
      }
      const updatedSurvey = await this.prisma.survey.update({
        where: {
          uuid: id,
        },
        data: {
          id_user: id_user ?? id_user,
          nama_survey: nama_survey ?? findSurvey.nama_survey,
          jenis_responden: jenis_responden ?? findSurvey.jenis_responden,
          status: status ?? findSurvey.status,
          responden_group: responden_group ?? findSurvey.responden_group,
        },
      })
      return {
        success: true,
        message: 'Survey updated successfully',
        data: updatedSurvey,
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const findSurvey = await this.prisma.survey.findFirst({
        where: {
          uuid: id,
        },
      })
      if (!findSurvey) {
        return {
          success: false,
          message: `Survey does not exists`,
          data: null
        }
      }

      const isAnswered = await this.prisma.hasil_survey.findFirst({
        where: {
          id_survey: findSurvey.uuid,
        },
      })
      if (isAnswered) {
        return {
          success: false,
          message: `Survey has been answered, cannot be deleted`,
          data: null
        }
      }

      // Get instrument
      const pertanyaanList = await this.prisma.pertanyaan.findMany({
        where: { id_survey: findSurvey.uuid },
        include: {
          opsi_pertanyaan: true,
        },
      });

      // Delete option
      const pertanyaanIds = pertanyaanList.map(p => p.uuid);
      const pilihanIds = pertanyaanList
        .filter(p => p.jenis === 'PILIHAN' || p.jenis === 'CHECKBOX')
        .flatMap(p => p.opsi_pertanyaan.map(o => o.uuid));

      if (pilihanIds.length > 0) {
        await this.prisma.opsi_pertanyaan.deleteMany({
          where: {
            uuid: { in: pilihanIds },
          },
        });
      }

      // Delete instrument
      if (pertanyaanIds.length > 0) {
        await this.prisma.pertanyaan.deleteMany({
          where: {
            uuid: { in: pertanyaanIds },
          },
        });
      }

      // Delete kategori
      await this.prisma.kategori.deleteMany({
        where: {
          id_survey: findSurvey.uuid,
        },
      });

      // Delete survey
      const deletedSurvey = await this.prisma.survey.delete({
        where: { uuid: id },
      });

      return {
        success: true,
        message: 'Survey deleted successfully',
        data: deletedSurvey,
      };

    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  async getSurveiResponden(id_survei: string, provinsi?: string) {
    try {
      const findSurvey = await this.prisma.survey.findFirst({
        where: {
          uuid: id_survei,
        },
      })
      if (!findSurvey) {
        return {
          success: false,
          message: `Survey does not exists`,
          data: null
        }
      }

      /** get lokasi petugas */
      const lokasiPetugas = await this.prisma.lokasi_petugas.findMany({
        where: {
          id_survey: findSurvey.uuid,
        },
        include: { responden: true },
      });

      const assignments = await this.prisma.assignments.findMany({
        where: { id_survey: findSurvey.uuid },
        include: { instansi: true }
      })

      // const respondenSurvei = Array.from(new Map(lokasiPetugas.flatMap(item => item.responden).map(item => [item?.uuid, item])).values());
      const respondenSurvei = Array.from(new Map(assignments.flatMap(item => item.instansi).map(item => [item?.uuid, item])).values());

      const arrIdResponden: string[] = provinsi ?
        respondenSurvei.filter(it => it?.provinsi === provinsi).map(responden => responden?.uuid).filter((id): id is string => typeof id === 'string') :
        respondenSurvei.map(responden => responden?.uuid).filter((id): id is string => typeof id === 'string');

      const hasilSurvey = await this.prisma.hasil_survey.findMany({
        where: {
          id_survey: findSurvey.uuid,
          id_responden: { in: arrIdResponden },
        },
      })

      let statisticSurvey = [
        { name: 'Sudah Mengisi', value: hasilSurvey.length },
        { name: 'Belum Mengisi', value: arrIdResponden.length - hasilSurvey.length },
      ]

      return {
        success: true,
        message: 'Survey found successfully',
        data: {
          provinces: Array.from(new Set(respondenSurvei.map(it => it?.provinsi))),
          statistics: statisticSurvey,
        },
      }
    } catch (error) {
      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }

  parseJsonAnswer = (jawaban: string): string | { id_opsi_jawaban: string, text: string } | { id_opsi_jawaban: string, text: string }[] => {
    try {
      return JSON.parse(jawaban);
    } catch (error) {
      return jawaban;
    }
  }

  parseJsonCatatan = (jawaban: string): string | { option_id: string, value: string } | { option_id: string, value: string }[] => {
    try {
      return JSON.parse(jawaban);
    } catch (error) {
      return jawaban;
    }
  }

  async downloadSurvey(id_survey: string, res: Response) {
    try {
      const findSurvey = await this.prisma.survey.findFirst({
        where: {
          uuid: id_survey,
        },
      })
      if (!findSurvey) {
        return {
          success: false,
          message: `Survey does not exists`,
          data: null
        }
      }

      const hasilSurvey = await this.prisma.hasil_survey.findMany({
        where: {
          id_survey: findSurvey.uuid,
        },
        include: {
          jawaban_survey: true,
          responden: {
            include: {
              instansi: true
            }
          }, user: true,
        },
      })

      const allQuestions = await this.prisma.pertanyaan.findMany({
        where: {
          id_survey: findSurvey.uuid,
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Survey Results`);

      const columns = [
        { header: 'Timestamps', key: 'timestamps', width: 30 },
        { header: 'Responden', key: 'responden', width: 30 },
        { header: 'Jenis Responden', key: 'jenis_responden', width: 30 },
        { header: 'Instansi', key: 'instansi', width: 30 },
        { header: 'Kode Instansi', key: 'kode_instansi', width: 30 },
        { header: 'Kota', key: 'kota', width: 30 },
        { header: 'Provinsi', key: 'provinsi', width: 30 },
        { header: 'Petugas', key: 'petugas', width: 30 },
      ]

      const rows: { timestamps: string, responden: string, [key: string]: string }[] = []

      for (let index = 0; index < allQuestions.length; index++) {
        const $ = cheerio.load(allQuestions[index].pertanyaan);
        $('table').remove(); // Remove table and its children
        $('ol, ul').remove(); // Remove ordered and unordered lists
        const cleanedPertanyaan = $.html();
        const formattedPertanyaan = cleanedPertanyaan
          .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
          .replace(/&amp;/g, '&') // Replace ampersand
          .replace(/&lt;/g, '<') // Replace less-than
          .replace(/&gt;/g, '>'); // Replace greater-than

        // Extract and format bold text (e.g., <strong> tags)
        const $formatted = cheerio.load(formattedPertanyaan);
        $formatted('strong').each((_, el) => {
          const boldText = $formatted(el).text();
          $formatted(el).replaceWith(`**${boldText}**`); // Mark bold text for Excel
        });
        $formatted('b').each((_, el) => {
          const boldText = $formatted(el).text();
          $formatted(el).replaceWith(`**${boldText}**`); // Mark bold text for Excel
        });


        const finalPertanyaan = $formatted.root().text();

        columns.push({
          header: finalPertanyaan,
          key: allQuestions[index].uuid,
          width: 100,
        });
      }

      const allJenisResponden = await this.prisma.jenis_responden.findMany()

      for (let i = 0; i < hasilSurvey.length; i++) {
        const tempRow: { timestamps: string, responden: string, [key: string]: string } = {
          timestamps: ``,
          responden: ``,
          jenis_responden: ``,
          instansi: ``,
          kode_instansi: ``,
          petugas: ``,
        }

        for (let index = 0; index < allQuestions.length; index++) {
          const jawaban = hasilSurvey[i].jawaban_survey.find(j => j.id_pertanyaan === allQuestions[index].uuid);
          const parseJawaban = this.parseJsonAnswer(jawaban?.jawaban || '');
          const parseCatatan = this.parseJsonCatatan(jawaban?.catatan || "")

          let finalAnswer: string = ``
          if (typeof parseJawaban === "string") {
            finalAnswer = parseJawaban
          } else if (Array.isArray(parseJawaban)) {
            finalAnswer = parseJawaban.map(j => {
              const findCatatan = (parseCatatan as { option_id: string, value: string }[] || []).find(it => it.option_id === j.id_opsi_jawaban)
              const note = findCatatan ? ` [${findCatatan.value}] ` : ""
              return `${j.text}${note}`
            }).join(", ")
          } else {
            finalAnswer = `${parseJawaban.text} ${parseCatatan as string || ""}`
          }

          // const catatanValue = typeof parseCatatan === 'string' ? parseCatatan : Array.isArray(parseCatatan) ? parseCatatan.map(j => j.value).join(', ') : parseCatatan.value || '';
          // const answerValue = typeof parseJawaban === 'string' ? parseJawaban : Array.isArray(parseJawaban) ? parseJawaban.map(j => j.text).join(`${jawaban?.catatan !== `` ? `\n (${catatanValue})` : ``}, `) : `${parseJawaban.text} ${jawaban?.catatan !== `` ? `\n (${catatanValue})` : ``}` || '';
          tempRow[allQuestions[index].uuid] = `${finalAnswer}`;
          tempRow[`timestamps`] = hasilSurvey[i].createdAt.toISOString();

          const nama = hasilSurvey[i].responden?.nama || 'Unknown';
          const [nama_responden, instansi] = nama.split("-")
          tempRow[`responden`] = nama_responden || 'Unknown';
          const id_jenis_responden = hasilSurvey[i].responden?.id_jenis_responden || ``
          const findJenis = allJenisResponden.find(it => it.uuid === id_jenis_responden)
          tempRow[`jenis_responden`] = findJenis?.jenis || 'Unknown';
          tempRow[`instansi`] = instansi || 'Unknown';
          tempRow[`kode_instansi`] = hasilSurvey[i].responden?.instansi?.kode_instansi || 'Unknown';
          tempRow[`kota`] = hasilSurvey[i].responden.kab_kota || "Unknown";
          tempRow[`provinsi`] = hasilSurvey[i].responden.provinsi || "Unknown";
          tempRow[`petugas`] = hasilSurvey[i].user?.nama_user || 'Unknown'
        }

        rows.push(tempRow);
      }


      worksheet.columns = columns
      worksheet.addRows(rows);
      worksheet.getRow(1).font = { bold: true };

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=report.xlsx',
      );

      // Write to response
      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.log(`error export excel: ${error}`);

      new InternalServerErrorException(`Something went wrong: ${error.message}`);
    }
  }
}
