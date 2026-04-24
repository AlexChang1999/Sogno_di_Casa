package com.sognodicasa.config;

import com.sognodicasa.model.Brand;
import com.sognodicasa.model.Designer;
import com.sognodicasa.repository.BrandRepository;
import com.sognodicasa.repository.DesignerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 啟動時自動匯入品牌 & 設計師 seed data
 *
 * 邏輯：
 *  - 以「名稱」為 key，已存在的品牌/設計師不會被覆寫（使用者在後台的修改會保留）
 *  - 僅補齊第一次啟動或之後新增的 seed 項目
 *
 * 資料來源：other_data/Iconic Furniture Products Brands and Pricing.xlsx
 * 描述文字由 Excel 商品欄位自動摘寫（Q4=A 的選擇）
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BrandDesignerSeeder implements CommandLineRunner {

    private final BrandRepository brandRepository;
    private final DesignerRepository designerRepository;

    @Override
    public void run(String... args) {
        seedBrands();
        seedDesigners();
    }

    // ── 品牌 seed data ──
    private void seedBrands() {
        addBrand("de Sede", "瑞士", 1962,
                "瑞士手工皮革家具工藝的代名詞",
                "de Sede 創立於 1962 年，總部位於瑞士 Klingnau，以極致的皮革工藝聞名全球。" +
                "品牌精選高品質皮革，結合手工裁縫與人體工學設計，打造出無數經典沙發作品。" +
                "其中最具代表性的 DS-600「蛇形沙發」更榮登金氏世界紀錄，成為現代家具史上的傳奇。",
                "https://www.desede.ch", 1);

        addBrand("Roche Bobois", "法國", 1960,
                "法式優雅與前衛設計的融合",
                "Roche Bobois 誕生於 1960 年的巴黎，是法國頂尖家具品牌，以獨樹一幟的設計美學享譽國際。" +
                "品牌長期與 Kenzo Takada、Hans Hopfer 等知名設計師合作，推出如 Mah Jong 模組沙發等經典之作，" +
                "靈感源自和服，展現東西方美學的融合。",
                "https://www.roche-bobois.com", 2);

        addBrand("B&B Italia", "義大利", 1966,
                "義式現代主義家具的領航者",
                "B&B Italia 於 1966 年在義大利北部創立，是全球現代設計家具的頂尖品牌。" +
                "與 Mario Bellini、Antonio Citterio、Patricia Urquiola 等大師長期合作，" +
                "打造出如 Camaleonda 等影響深遠的模組化沙發，其 1970 年問世的 capitonné 設計至今仍是經典。",
                "https://www.bebitalia.com", 3);

        addBrand("Flexform", "義大利", 1959,
                "義大利匠心工藝與低調優雅",
                "Flexform 成立於 1959 年，位於義大利米蘭附近的 Meda，是義式家具工藝的代表品牌之一。" +
                "品牌與設計師 Antonio Citterio 的長期合作，締造出如 Groundpiece 這樣的經典模組沙發，" +
                "以鵝絨坐墊與精緻金屬收納扶手等標誌性細節聞名。",
                "https://www.flexform.it", 4);

        addBrand("PP Møbler", "丹麥", 1953,
                "丹麥手工木作的堅持者",
                "PP Møbler 創立於 1953 年，位於丹麥 Allerød，是少數仍以全手工製作的北歐家具工坊。" +
                "每張椅子需至少兩週的製作時間，完整延續 Hans J. Wegner 等設計大師的作品精髓，" +
                "其中 PP19「Papa Bear」熊掌椅更是收藏家眼中的夢幻逸品。",
                "https://www.ppdk.com", 5);

        addBrand("Fritz Hansen", "丹麥", 1872,
                "北歐現代設計的百年傳承",
                "Fritz Hansen 創立於 1872 年，是丹麥歷史最悠久的家具品牌之一。" +
                "品牌與 Arne Jacobsen、Poul Kjærholm 等大師合作，締造出如 Egg Chair、Swan Chair、Series 7 等無數經典。" +
                "1958 年為 SAS Royal Hotel 設計的 Egg Chair 至今仍是現代主義家具的圖騰。",
                "https://www.fritzhansen.com", 6);

        addBrand("Minotti", "義大利", 1948,
                "當代義式優雅的定義者",
                "Minotti 於 1948 年在義大利 Meda 創立，以精緻的義式手工工藝與現代設計美學聞名。" +
                "自 1997 年起由 Rodolfo Dordoni 擔任藝術總監，打造出如 Hamilton 等結合鵝絨坐墊與鍍鉻底座的經典作品，" +
                "展現當代奢華生活的低調優雅。",
                "https://www.minotti.com", 7);

        addBrand("Poltrona Frau", "義大利", 1912,
                "義式皮革工藝的百年傳奇",
                "Poltrona Frau 創立於 1912 年的義大利都靈，擁有超過百年的皮革工藝傳承。" +
                "品牌獨家的 Pelle Frau® 皮革以嚴選與手工染色聞名，每件家具需花費超過 20 小時的純手工製作。" +
                "1930 年誕生的 Vanity Fair 扶手椅以 275 顆皮革包覆釘為標誌，至今仍是品牌的靈魂之作。",
                "https://www.poltronafrau.com", 8);

        addBrand("Giorgetti", "義大利", 1898,
                "精雕細琢的義大利木作美學",
                "Giorgetti 於 1898 年創立，發源於義大利米蘭北方，擁有逾百年的木作工藝傳承。" +
                "品牌以胡桃木、Pau Ferro 等珍貴木材搭配絲絨、皮革打造高端家具，" +
                "其 Progetti 扶手椅的彎曲扶手靈感來自古董手杖，Hug 扶手椅則以流暢的曲線展現詩意設計。",
                "https://www.giorgettimeda.com", 9);

        addBrand("Cassina", "義大利", 1927,
                "義大利設計史的活教科書",
                "Cassina 創立於 1927 年，被譽為「當代設計的搖籃」。" +
                "品牌擁有 Le Corbusier、Gio Ponti、Charlotte Perriand 等大師的官方授權，復刻出如 LC2 扶手椅等 20 世紀經典。" +
                "Cassina 的作品被 MoMA 等世界級美術館永久收藏，象徵著義大利設計的最高成就。",
                "https://www.cassina.com", 10);

        addBrand("Carl Hansen & Søn", "丹麥", 1908,
                "北歐工藝的極致典範",
                "Carl Hansen & Søn 創立於 1908 年，是丹麥家具工藝的翹楚。" +
                "品牌自 1949 年起與 Hans J. Wegner 展開傳奇合作，打造出 CH24 Wishbone Chair 這件需歷經 100 多道手工工序的經典作品，" +
                "其標誌性的 Y 字型椅背與編織紙繩座面，至今仍由工匠以全手工完成。",
                "https://www.carlhansen.com", 11);

        log.info("✓ Brand seed data 完成，目前品牌數：{}", brandRepository.count());
    }

    // ── 設計師 seed data ──
    private void seedDesigners() {
        addDesigner("Hans J. Wegner", "丹麥", 1914, 2007,
                "椅子的詩人",
                "Hans J. Wegner 被譽為「椅子的大師」與「椅子的詩人」，一生設計超過 500 款椅子。" +
                "他堅信「一件作品只有從各個角度看都美才算完成」，其作品如 Wishbone Chair、Papa Bear Chair、Shell Chair 等，" +
                "不僅是北歐現代主義設計的代表，更是全球家具設計史上的瑰寶。",
                "Carl Hansen & Søn, PP Møbler, Fritz Hansen",
                "CH24 Wishbone Chair, PP19 Papa Bear Chair", 1);

        addDesigner("Arne Jacobsen", "丹麥", 1902, 1971,
                "北歐現代主義建築與家具大師",
                "Arne Jacobsen 是丹麥最具影響力的建築師與設計師，作品涵蓋建築、家具、餐具等各領域。" +
                "他於 1958 年為哥本哈根 SAS Royal Hotel 設計的 Egg Chair 與 Swan Chair，" +
                "將有機曲線推向極致，成為 20 世紀現代主義設計的經典符號。",
                "Fritz Hansen",
                "Egg Chair, Swan Chair, Series 7 Chair", 2);

        addDesigner("Mario Bellini", "義大利", 1935, null,
                "義式前衛設計的代表人物",
                "Mario Bellini 是義大利當代最具影響力的建築師與工業設計師之一，榮獲 8 次 Compasso d'Oro 金獎。" +
                "他為 B&B Italia 設計的 Camaleonda 沙發（1970）以模組化概念打破傳統沙發框架，" +
                "其作品被 MoMA、維多利亞與艾伯特博物館永久收藏。",
                "B&B Italia, Cassina",
                "Camaleonda Sofa, Le Bambole Sofa", 3);

        addDesigner("Antonio Citterio", "義大利", 1950, null,
                "當代義式設計的全才",
                "Antonio Citterio 是當代最受推崇的義大利建築師與設計師之一。" +
                "他與 Flexform、B&B Italia、Vitra、Maxalto 等頂尖品牌長期合作，" +
                "Groundpiece 沙發（Flexform）是其代表作之一，以低調優雅的比例與鵝絨坐墊成為現代客廳的理想選擇。",
                "Flexform, B&B Italia, Vitra",
                "Groundpiece Sofa, Charles Sofa", 4);

        addDesigner("Le Corbusier", "瑞士/法國", 1887, 1965,
                "現代建築之父",
                "Le Corbusier（本名 Charles-Édouard Jeanneret）是 20 世紀最偉大的建築師與設計師之一。" +
                "他與 Pierre Jeanneret、Charlotte Perriand 於 1928 年共同設計的 LC 系列家具（包括 LC2、LC4 躺椅），" +
                "將金屬管件與皮革結合，開啟了現代主義家具的新紀元，至今仍由 Cassina 生產並被 MoMA 收藏。",
                "Cassina",
                "LC2 Armchair, LC4 Chaise Longue", 5);

        addDesigner("Charlotte Perriand", "法國", 1903, 1999,
                "現代主義女性設計先驅",
                "Charlotte Perriand 是 20 世紀最具影響力的女性設計師之一，擅長以機能性、手工性與自然材料融合現代主義。" +
                "她於 1927–1937 年間與 Le Corbusier、Pierre Jeanneret 共同合作，為現代家具奠定基礎。" +
                "其作品強調「生活的藝術」，至今仍深刻影響當代設計。",
                "Cassina",
                "LC2 Armchair (collaboration), Nuage Shelving", 6);

        addDesigner("Pierre Jeanneret", "瑞士", 1896, 1967,
                "理性美學的建築設計師",
                "Pierre Jeanneret 是 Le Corbusier 的堂弟與長期合作夥伴，以內斂且理性的設計風格聞名。" +
                "他參與 LC 系列家具設計，並於 1951–1965 年為印度 Chandigarh 城市規劃設計了大量公共家具，" +
                "其作品以柚木與簡潔線條展現亞洲氣候下的現代主義美學。",
                "Cassina",
                "LC2 Armchair, Chandigarh Chair", 7);

        addDesigner("Rodolfo Dordoni", "義大利", 1954, 2023,
                "Minotti 的靈魂人物",
                "Rodolfo Dordoni 是義大利當代設計大師，自 1997 年起擔任 Minotti 的藝術總監，" +
                "為品牌奠定了沉穩內斂的當代美學基調。" +
                "他為 Minotti 設計的 Hamilton、Andersen 等系列沙發，以鍍鉻底座與精準比例成為當代家具的標竿。",
                "Minotti, Cassina, Flos",
                "Hamilton Sectional Sofa, Andersen Sofa", 8);

        addDesigner("Ueli Berger", "瑞士", 1937, 2008,
                "瑞士藝術家與家具設計師",
                "Ueli Berger 是瑞士藝術家、雕塑家與家具設計師，其作品橫跨藝術與實用領域。" +
                "他與 Eleonore Peduzzi Riva、Heinz Ulrich、Klaus Vogt 共同為 de Sede 設計的 DS-600「蛇形沙發」（1972），" +
                "以靈活的模組單元顛覆了沙發的傳統形式，創造出可無限延伸的創新之作。",
                "de Sede",
                "DS-600 Snake Sofa", 9);

        addDesigner("Hans Hopfer", "德國", 1935, null,
                "Mah Jong 沙發之父",
                "Hans Hopfer 是德國設計師，1971 年為 Roche Bobois 設計了傳奇的 Mah Jong 模組沙發。" +
                "作品靈感來自日本和服與東方席地生活文化，以自由堆疊的坐墊與靠背打破傳統沙發的僵化形式，" +
                "成為 20 世紀最具辨識度的模組沙發之一。",
                "Roche Bobois",
                "Mah Jong Modular Sofa", 10);

        addDesigner("Kenzo Takada", "日本", 1939, 2020,
                "跨界時尚與家具的大師",
                "高田賢三（Kenzo Takada）是享譽國際的日本時裝設計師，1970 年在巴黎創立 KENZO 品牌。" +
                "晚年與 Roche Bobois 合作，為 Mah Jong 沙發設計「Yoru」等布料系列，" +
                "以天鵝絨與羊毛混紡呈現東方情調，讓家具成為穿戴式藝術的延伸。",
                "Roche Bobois",
                "Mah Jong Sofa (Yoru Collection)", 11);

        addDesigner("Renzo Frau", "義大利", 1881, 1926,
                "Poltrona Frau 創始人",
                "Renzo Frau 於 1912 年在義大利都靈創立 Poltrona Frau，開創了義式皮革工藝的百年傳奇。" +
                "他於 1930 年設計的 Vanity Fair 扶手椅以 275 顆皮革包覆釘與飽滿的曲線成為品牌圖騰，" +
                "至今仍是 Poltrona Frau 最具代表性的作品之一。",
                "Poltrona Frau",
                "Vanity Fair Armchair", 12);

        addDesigner("Roberto Lazzeroni", "義大利", 1950, null,
                "義式經典的現代詮釋者",
                "Roberto Lazzeroni 是義大利當代設計師，以重新詮釋經典著稱。" +
                "他為 Poltrona Frau 改良 Vanity Fair 扶手椅的比例，打造出更符合現代生活的 Vanity Fair XC 版本，" +
                "在保留品牌傳統工藝精髓的同時，融入當代使用需求。",
                "Poltrona Frau, Ceccotti Collezioni",
                "Vanity Fair XC Armchair", 13);

        addDesigner("Umberto Asnago", "義大利", 1949, null,
                "Giorgetti 長期合作大師",
                "Umberto Asnago 是義大利資深家具設計師，曾任 Giorgetti 設計總監多年。" +
                "他為 Giorgetti 設計的 Progetti 系列（1987）扶手椅以彎曲扶手靈感來自古董手杖，" +
                "結合 Pau Ferro 木材與精緻比例，成為品牌最長青的作品之一。",
                "Giorgetti",
                "Progetti Armchair", 14);

        log.info("✓ Designer seed data 完成，目前設計師數：{}", designerRepository.count());
    }

    // ── 輔助方法：只在品牌不存在時新增 ──
    private void addBrand(String name, String country, Integer foundedYear,
                          String tagline, String description, String websiteUrl, Integer sortOrder) {
        brandRepository.findByName(name).orElseGet(() -> {
            Brand b = new Brand();
            b.setName(name);
            b.setCountry(country);
            b.setFoundedYear(foundedYear);
            b.setTagline(tagline);
            b.setDescription(description);
            b.setWebsiteUrl(websiteUrl);
            b.setSortOrder(sortOrder);
            return brandRepository.save(b);
        });
    }

    // ── 輔助方法：只在設計師不存在時新增 ──
    private void addDesigner(String name, String nationality, Integer birthYear, Integer deathYear,
                             String tagline, String biography, String associatedBrands,
                             String famousWorks, Integer sortOrder) {
        designerRepository.findByName(name).orElseGet(() -> {
            Designer d = new Designer();
            d.setName(name);
            d.setNationality(nationality);
            d.setBirthYear(birthYear);
            d.setDeathYear(deathYear);
            d.setTagline(tagline);
            d.setBiography(biography);
            d.setAssociatedBrands(associatedBrands);
            d.setFamousWorks(famousWorks);
            d.setSortOrder(sortOrder);
            return designerRepository.save(d);
        });
    }
}
