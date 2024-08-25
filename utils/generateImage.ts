import Jimp from 'jimp';

export default async function generateInitialsImage(username: string) {
    const initials = username.charAt(0).toUpperCase();
    const image = new Jimp(100, 100, '#ffffff');
    
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    image.print(font, 0, 0, {
        text: initials,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    }, 100, 100);

    const filePath = `${process.env.PROFILE_PICTURE_DIR}/${username}_profile.png`;
    await image.writeAsync(`./public${filePath}`);
    
    return filePath;
}