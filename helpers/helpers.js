export const generate_id = (len = 17) => {
    var randomId = require('random-id');
    // pattern to determin how the id will be generated
    // default is aA0 it has a chance for lowercased capitals and numbers
    var pattern = 'aA0';

    return randomId(len, pattern);
}

export const sendBookEmail = async (buyer_email) => {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
        service: 'Microsoft',
        auth: {
            user: 'secret',
            pass: 'secret!'
        }
    });
    const options = {
        from: 'supoort.tazweed@outlook.com',
        to: buyer_email,
        subject: 'Book a slot',
        text: 'Slot is booked successfully!'
    };

    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log("error in sending email : ", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    return 'done';
}