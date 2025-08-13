import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

// --- INTERFACES ---

interface FileWithPreview extends File {
    preview?: string;
}

interface StaffDetail {
    name: string;
    designation: string;
    iqamah: string;
    validityDate: string;
}

interface FormData {
    CustomerType: string;
    regionCity: string;
    applicationDate: string;
    customerchoice: string;
    tradeNameArabic: string;
    tradeNameEnglish: string;
    businessType: string;
    commercialRegNo: string;
    date: string;
    expiryDate: string;
    vatNo: string;
    mainActivity: string;
    managingDirector: string;
    authorizedSignatory: string;
    noOfBranches: string;
    noOfEmployees: string;
    nationalAddress: string;
    officialPhone: string;
    mobileNo: string;
    officialWebsite: string;

    companyNameCash: string;
    authorizedSignatoryCash: string;
    kamNameCash: string;
    companyStampFile: FileWithPreview | null;
    authorizedSignatureFile: FileWithPreview | null;
    kamSignatureFile: FileWithPreview | null;

    requiredDocuments: string[];

    authorizedStaff: string[]

    docAuthSignatoryIdFile: FileWithPreview | null;
    docMainCommCertFile: FileWithPreview | null;
    docVatCertFile: FileWithPreview | null;
}

interface FilePayload {
    fileName: string;
    contentType: string;
    content: string;
}


const CashCustomers = () => {
    const navigate = useNavigate();

    const Exit = () => {
        navigate('/');
    };

    const initialFormData: FormData = {
        CustomerType: 'Cash Customers',
        regionCity: '',
        applicationDate: new Date().toISOString().split('T')[0],
        customerchoice: '',
        tradeNameArabic: '',
        tradeNameEnglish: '',
        businessType: '',
        commercialRegNo: '',
        date: '',
        expiryDate: '',
        vatNo: '',
        mainActivity: '',
        managingDirector: '',
        authorizedSignatory: '',
        noOfBranches: '',
        noOfEmployees: '',
        nationalAddress: '',
        officialPhone: '',
        mobileNo: '',
        officialWebsite: '',
        authorizedStaff: [],
        companyNameCash: '',
        authorizedSignatoryCash: '',
        kamNameCash: '',
        companyStampFile: null,
        authorizedSignatureFile: null,
        kamSignatureFile: null,
        requiredDocuments: [],
        docAuthSignatoryIdFile: null,
        docMainCommCertFile: null,
        docVatCertFile: null,
    };

    const createInitialStaff = (): StaffDetail[] =>
        Array.from({ length: 1 }, () => ({
            name: "", designation: "", iqamah: "", validityDate: "",
        }));

    const [formData, setFormData] = React.useState<FormData>({ ...initialFormData });
    const [authorizedStaff, setAuthorizedStaff] = React.useState<StaffDetail[]>(createInitialStaff());
    const [loading, setLoading] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
    const [activeFieldName, setActiveFieldName] = React.useState<keyof FormData | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const Url = "https://prod-25.centralindia.logic.azure.com:443/workflows/5d163597298b424185cb0cb9e4b9b176/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9W4uNSJYqSiUASKzpRIEIJUm9u3LoHXt6ugpWqmJc7U";



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBusinessTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            let updatedList = prev.businessType ? prev.businessType.split(", ") : [];
            if (checked) {
                updatedList.push(value);
            } else {
                updatedList = updatedList.filter((item) => item !== value);
            }
            return { ...prev, businessType: updatedList.join(", ") };
        });
    };

    const handleRequiredDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            let updatedList = [...prev.requiredDocuments];
            if (checked) {
                updatedList.push(value);
            } else {
                updatedList = updatedList.filter((item) => item !== value);

                const docKey = requiredDocumentsList.find(d => d.value === value)?.key;
                if (docKey) {
                    return { ...prev, requiredDocuments: updatedList, [docKey]: null };
                }
            }
            return { ...prev, requiredDocuments: updatedList };
        });
    };

    const handleStaffChange = (index: number, field: keyof StaffDetail, value: string) => {
        const updatedStaff = [...authorizedStaff];
        updatedStaff[index][field] = value;
        setAuthorizedStaff(updatedStaff);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const handleGenericUploadClick = (fieldName: keyof FormData) => {
        setActiveFieldName(fieldName);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeFieldName) return;

        setFormData(prev => ({ ...prev, [activeFieldName]: file as FileWithPreview }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setActiveFieldName(null);
    };

    const removeGenericFile = (fieldName: keyof FormData) => {
        setFormData(prev => ({ ...prev, [fieldName]: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);

        try {
            const filesPayload: FilePayload[] = [];

            const fileFieldsToProcess: { field: keyof FormData; prefix: string }[] = [
                { field: 'companyStampFile', prefix: 'CompanyStamp_' },
                { field: 'authorizedSignatureFile', prefix: 'AuthorizedSignature_' },
                { field: 'kamSignatureFile', prefix: 'KAMSignature_' },
                { field: 'docAuthSignatoryIdFile', prefix: 'Authorized_Signatory_ID_' },
                { field: 'docMainCommCertFile', prefix: 'Main_Commercial_Reg_Certificate_' },
                { field: 'docVatCertFile', prefix: 'VAT_Registration_Certificate_' },
            ];

            for (const { field, prefix } of fileFieldsToProcess) {
                const file = formData[field] as FileWithPreview | null;
                if (file) {
                    const base64Content = await fileToBase64(file);
                    filesPayload.push({
                        fileName: `${prefix}${file.name}`,
                        contentType: file.type,
                        content: base64Content,
                    });
                }
            }

            const staffString = JSON.stringify(
                authorizedStaff.filter(s => s.name || s.designation || s.iqamah || s.validityDate)
            );

            const {
                companyStampFile, authorizedSignatureFile, kamSignatureFile,
                docAuthSignatoryIdFile, docMainCommCertFile, docVatCertFile,
                ...restOfFormData
            } = formData;

            const payload = {
                ...restOfFormData,
                authorizedStaff: staffString,
                requiredDocuments: formData.requiredDocuments.join(', '),
                files: filesPayload,
            };

            const response = await fetch(Url, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
            });

            if (response.ok) {
                setStatusMessage("Form submitted successfully!");
                setFormData({ ...initialFormData });
                setAuthorizedStaff(createInitialStaff());
                setTimeout(() => navigate('/'), 500);
            } else {
                throw new Error(`Server responded with status: ${response.status}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            setStatusMessage("Failed to submit form. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const requiredDocumentsList = [
        { key: 'docAuthSignatoryIdFile', value: 'Authorized Signatory ID', label: 'Authorized Signatory ID / هوية الشخص المفوض بالتوقيع' },
        { key: 'docMainCommCertFile', value: 'Main Commercial Certificate', label: 'Main Commercial Reg.Certificate / صورة السجل الرئيسي ساري المفعول' },
        { key: 'docVatCertFile', value: 'VAT registration Certificate', label: 'VAT registration Certificate / صورة من شهادة ضريبة القيمة المضافة' },
    ];

    return (
        <div className="mt-4" style={{ color: 'black', width: '91vw', marginLeft: '4vw' }}>
            <input type="file" accept="image/*,.pdf" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

            <form onSubmit={handleSubmit}>
                <div className="card mb-5" style={{ borderRadius: '15px', border: '2px solid #FCCE07' }}>
                    <div className="mb-2 text-center pt-2">
                        <h4 className="mb-0" style={{ color: '#1c325d', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Cash Customers
                        </h4>
                    </div>
                    <div className="card-body" style={{ color: 'black' }}>
                        {/* Request Information */}
                        <div className="mb-5">
                            <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">Request Information / معلومات الطلب</h6>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="regionCity" className="form-label">Region / City / المنطقة / المدينة <span className="text-danger">*</span></label>
                                    <input
                                        id="regionCity"
                                        name="regionCity"
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter region or city"
                                        value={formData.regionCity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="applicationDate" className="form-label">Application Date / تاريخ الطلب <span className="text-danger">*</span></label>
                                    <input
                                        id="applicationDate"
                                        type="date"
                                        name="applicationDate"
                                        className="form-control"
                                        value={formData.applicationDate}
                                        onChange={handleChange}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label d-block">Customer Type / نوع العميل <span className="text-danger">*</span></label>
                                <div className="d-flex flex-wrap">
                                    {['Former', 'Current', 'New'].map((type) => (
                                        <div className="form-check form-check-inline me-4" key={type}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="customerchoice"
                                                id={`customerType${type}`}
                                                value={type}
                                                checked={formData.customerchoice === type}
                                                onChange={handleChange}
                                                required
                                            />
                                            <label className="form-check-label" htmlFor={`customerType${type}`}>
                                                {type} / {type === 'Former' ? 'سابق' : type === 'Current' ? 'قائم' : 'جدید'}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="mb-5">
                            <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">Basic Information / المعلومات الأساسية</h6>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="tradeNameArabic" className="form-label">Trade Name (Arabic) <span className="text-danger">*</span></label><br />
                                    اسم العميل التجاري ( عربي ) <br /><br />
                                    <input
                                        id="tradeNameArabic"
                                        type="text"
                                        name='tradeNameArabic'
                                        className="form-control"
                                        placeholder="Enter Arabic trade name"
                                        value={formData.tradeNameArabic}
                                        onChange={handleChange}
                                        style={{ textAlign: 'right' }}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="tradeNameEnglish" className="form-label">Trade Name (English) <span className="text-danger">*</span></label><br />
                                    اسم العميل التجاري( انجليزي ) <br /><br />
                                    <input
                                        id="tradeNameEnglish"
                                        type="text"
                                        name='tradeNameEnglish'
                                        className="form-control"
                                        placeholder="Enter English trade name"
                                        value={formData.tradeNameEnglish}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label d-block">Facility Type / نوع المنشأة <span className="text-danger">*</span></label>
                                <div className="row">
                                    <div className="col-md-6">
                                        {['Sole Proprietorship', 'Joint-stock'].map((type) => (
                                            <div className="form-check" key={type}>
                                                <input
                                                    className="form-check-input" type="checkbox" name="businessType"
                                                    id={type.toLowerCase().replace(' ', '')} value={type}
                                                    checked={formData.businessType.includes(type)} onChange={handleBusinessTypeChange}
                                                />
                                                <label className="form-check-label" htmlFor={type.toLowerCase().replace(' ', '')}>
                                                    {type} / {type === 'Sole Proprietorship' ? 'فردية' : 'مساهمة'}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="col-md-6">
                                        {['Partnership', 'Limited Liability'].map((type) => (
                                            <div className="form-check" key={type}>
                                                <input
                                                    className="form-check-input" type="checkbox" name="businessType"
                                                    id={type.toLowerCase().replace(' ', '')} value={type}
                                                    checked={formData.businessType.includes(type)} onChange={handleBusinessTypeChange}
                                                />
                                                <label className="form-check-label" htmlFor={type.toLowerCase().replace(' ', '')}>
                                                    {type} / {type === 'Partnership' ? 'تضامنية' : 'مسؤولية محدودة'}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="commercialRegNo" className="form-label">Commercial Reg. No. <span className="text-danger">*</span></label><br />
                                    رقم السجل التجاري <br /><br />
                                    <input
                                        id="commercialRegNo"
                                        type="text"
                                        name='commercialRegNo'
                                        value={formData.commercialRegNo}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder='Enter commercial registration number'
                                        required
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="date" className="form-label">Date <span className="text-danger">*</span></label><br />
                                    تاريخ <br /><br />
                                    <input
                                        id="date"
                                        name='date'
                                        value={formData.date}
                                        onChange={handleChange}
                                        type="date"
                                        className="form-control"
                                        required
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="expiryDate" className="form-label">Expiry Date <span className="text-danger">*</span></label><br />
                                    تاريخ الانتهاء <br /><br />
                                    <input
                                        id="expiryDate"
                                        type="date"
                                        name='expiryDate'
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="vatNo" className="form-label">VAT No. / الرقم الضريبي <span className="text-danger">*</span></label>
                                <input
                                    id="vatNo"
                                    type="text"
                                    name='vatNo'
                                    value={formData.vatNo}
                                    onChange={handleChange}
                                    placeholder="Enter VAT number"
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="mainActivity" className="form-label">Main Activity / النشاط الرئيسي <span className="text-danger">*</span></label>
                                <input
                                    id="mainActivity"
                                    name='mainActivity'
                                    value={formData.mainActivity}
                                    onChange={handleChange}
                                    placeholder="Enter main activity"
                                    type="text"
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="managingDirector" className="form-label">Managing Director / المدير المسئول <span className="text-danger">*</span></label>
                                <input
                                    id="managingDirector"
                                    type="text"
                                    name='managingDirector'
                                    className="form-control"
                                    value={formData.managingDirector}
                                    onChange={handleChange}
                                    placeholder='Enter managing director name'
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="authorizedSignatory" className="form-label">Authorized Signatory / المفوض بالتوقيع <span className="text-danger">*</span></label>
                                <input
                                    id="authorizedSignatory"
                                    type="text"
                                    className="form-control"
                                    name='authorizedSignatory'
                                    value={formData.authorizedSignatory}
                                    onChange={handleChange}
                                    placeholder='Enter authorized signatory name'
                                    required
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="noOfBranches" className="form-label">No. of Branches / عدد الفروع <span className="text-danger">*</span></label>
                                    <input
                                        id="noOfBranches"
                                        type="text"
                                        className="form-control"
                                        name='noOfBranches'
                                        value={formData.noOfBranches}
                                        onChange={handleChange}
                                        placeholder='Enter number of branches'
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="noOfEmployees" className="form-label">No. of Employees / عدد الموظفين <span className="text-danger">*</span></label>
                                    <input
                                        id="noOfEmployees"
                                        type="text"
                                        className="form-control"
                                        name='noOfEmployees'
                                        value={formData.noOfEmployees}
                                        onChange={handleChange}
                                        placeholder='Enter number of employees'
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="nationalAddress" className="form-label">National Address / العنوان الوطني <span className="text-danger">*</span></label>
                                <input
                                    id="nationalAddress"
                                    type="text"
                                    className="form-control"
                                    name='nationalAddress'
                                    value={formData.nationalAddress}
                                    onChange={handleChange}
                                    placeholder='Enter national address'
                                    required
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="officialPhone" className="form-label">Official Phone / الهاتف الرسمي <span className="text-danger">*</span></label>
                                    <input
                                        id="officialPhone"
                                        type="tel"
                                        className="form-control"
                                        name='officialPhone'
                                        value={formData.officialPhone}
                                        onChange={handleChange}
                                        placeholder='Enter official phone'
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="mobileNo" className="form-label">Mobile No / الجوال <span className="text-danger">*</span></label>
                                    <input
                                        id="mobileNo"
                                        type="tel"
                                        className="form-control"
                                        name='mobileNo'
                                        value={formData.mobileNo}
                                        onChange={handleChange}
                                        placeholder='Enter mobile number'
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="officialWebsite" className="form-label">Official Website / الموقع الالكتروني</label>
                                <input
                                    id="officialWebsite"
                                    type="url"
                                    className="form-control"
                                    name='officialWebsite'
                                    value={formData.officialWebsite}
                                    onChange={handleChange}
                                    placeholder='Enter official website URL'
                                />
                            </div>
                        </div>

                        {/* Authorized Staff */}
                        <div className="mb-5">
                            <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">Authorized Finance and Procurement Department Staff / المعتمدين في قسم المالية و المشتريات لدى الشركة</h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered text-center">
                                    <thead className="align-middle table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Designation</th>
                                            <th>ID/IQAMAH</th>
                                            <th>Validity date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {authorizedStaff.map((staff, i) => (
                                            <tr key={i}>
                                                <td><input type="text" className="form-control" value={staff.name} onChange={(e) => handleStaffChange(i, 'name', e.target.value)} /></td>
                                                <td><input type="text" className="form-control" value={staff.designation} onChange={(e) => handleStaffChange(i, 'designation', e.target.value)} /></td>
                                                <td><input type="text" className="form-control" value={staff.iqamah} onChange={(e) => handleStaffChange(i, 'iqamah', e.target.value)} /></td>
                                                <td><input type="date" className="form-control" value={staff.validityDate} onChange={(e) => handleStaffChange(i, 'validityDate', e.target.value)} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Cash in advance Customer only */}
                        <div className="mb-5">
                            <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">Cash in advance Customer only / لعملاء الدفع المقدم فقط</h6>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="companyNameCash" className="form-label">Company Name / اسم الشركة <span className="text-danger">*</span></label>
                                        <input type="text" name='companyNameCash' value={formData.companyNameCash} onChange={handleChange} placeholder='Enter company name' className="form-control" id="companyNameCash" required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="companyStampFile" className="form-label">Company Stamp / الختم <span className="text-danger">*</span></label><br />
                                        <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={() => handleGenericUploadClick('companyStampFile')}>Upload Company Stamp</button>
                                        {formData.companyStampFile && (
                                            <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                                <span className="text-truncate" style={{ maxWidth: '150px' }}>{formData.companyStampFile.name}</span>
                                                <button type="button" onClick={() => removeGenericFile('companyStampFile')} className="btn-close" aria-label="Remove"></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="kamNameCash" className="form-label">KAM Name / اسم مدير الحساب <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="kamNameCash" name="kamNameCash" value={formData.kamNameCash} onChange={handleChange} placeholder="Enter KAM Name" required />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="authorizedSignatoryCash" className="form-label">Authorized Signatory /اســــم المـفــوض <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" id="authorizedSignatoryCash" name='authorizedSignatoryCash' value={formData.authorizedSignatoryCash} onChange={handleChange} placeholder='Enter authorized name' required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="authorizedSignatureFile" className="form-label">Authorized Signature / التوقيع <span className="text-danger">*</span></label><br />
                                        <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={() => handleGenericUploadClick('authorizedSignatureFile')}>Upload Authorized Signature</button>
                                        {formData.authorizedSignatureFile && (
                                            <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                                <span className="text-truncate" style={{ maxWidth: '150px' }}>{formData.authorizedSignatureFile.name}</span>
                                                <button type="button" onClick={() => removeGenericFile('authorizedSignatureFile')} className="btn-close" aria-label="Remove"></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="kamSignatureFile" className="form-label">KAM Signature / التوقيع <span className="text-danger">*</span></label><br />
                                        <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={() => handleGenericUploadClick('kamSignatureFile')}>Upload KAM Signature</button>
                                        {formData.kamSignatureFile && (
                                            <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                                <span className="text-truncate" style={{ maxWidth: '150px' }}>{formData.kamSignatureFile.name}</span>
                                                <button type="button" onClick={() => removeGenericFile('kamSignatureFile')} className="btn-close" aria-label="Remove"></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Required Documents */}
                        <div className="p-1 my-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                            <h6 className="mb-0">Required Documents / الاوراق المطلوبة</h6>
                        </div>
                        <div className="row">
                            {requiredDocumentsList.map((doc) => (
                                <div className="col-md-12 mb-3" key={doc.key}>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input" type="checkbox"
                                            value={doc.value} id={doc.key}
                                            checked={formData.requiredDocuments.includes(doc.value)}
                                            onChange={handleRequiredDocsChange}
                                        />
                                        <label className="form-check-label" htmlFor={doc.key}>{doc.label}</label>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm mt-1"
                                        disabled={!formData.requiredDocuments.includes(doc.value)}
                                        onClick={() => handleGenericUploadClick(doc.key as keyof FormData)}
                                    >
                                        Upload File
                                    </button>
                                    {formData[doc.key as keyof FormData] && (
                                        <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                            <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                                {(formData[doc.key as keyof FormData] as File).name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeGenericFile(doc.key as keyof FormData)}
                                                className="btn-close" aria-label="Remove"
                                            ></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit and Exit Buttons */}
                <div className="text-center pb-3" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button type="submit" className="btn" style={{ backgroundColor: '#ffc107', color: 'black', borderRadius: '5px', padding: '8px 16px' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                    <button type="button" className="btn btn-danger" style={{ borderRadius: '5px', padding: '8px 16px' }} onClick={Exit}>
                        Exit
                    </button>
                </div>
            </form>

            {/* Loading Modal */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500 mx-auto mb-4"></div>
                        <h5 className="text-lg font-medium text-gray-800">Submitting your form...</h5>
                    </div>
                </div>
            )}

            {/* Success / Error Message Modal */}
            {statusMessage && !loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
                        <h5 className="text-lg font-medium text-gray-800 mb-4">{statusMessage}</h5>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={() => setStatusMessage(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashCustomers;
